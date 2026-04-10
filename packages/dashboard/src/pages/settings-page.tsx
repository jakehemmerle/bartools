import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useSearchParams } from 'react-router-dom'
import { StatePanel } from '../components/states/state-panel'
import { resolvePersonaOverride, useFixtureSession } from '../lib/fixture-session'
import { inventoryScenarios, settingsScenarios } from '../lib/fixtures/scenarios'
import type {
  BarMember,
  ProductParOverride,
} from '../lib/fixtures/schemas'

type ComparableUnit = ProductParOverride['parComparableUnit']
type OverrideDrafts = Record<string, string>

export function SettingsPage() {
  const [searchParams] = useSearchParams()
  const { persona } = useFixtureSession()
  const effectivePersona = resolvePersonaOverride(
    `?${searchParams.toString()}`,
    persona,
  )
  const scenario =
    searchParams.get('scenario') === 'restricted' || effectivePersona === 'staff'
      ? settingsScenarios.restricted
      : settingsScenarios.manager
  const canManage = scenario.user.canManageBar

  const [timezone, setTimezone] = useState(scenario.barSettings.timezone)
  const [defaultPar, setDefaultPar] = useState(
    String(scenario.barSettings.defaultParComparableAmount),
  )
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null)
  const [overrideSearch, setOverrideSearch] = useState('')
  const [overrideMap, setOverrideMap] = useState<Record<string, ProductParOverride>>(
    () =>
      Object.fromEntries(
        scenario.overrides.map((override) => [override.productId, override]),
      ),
  )
  const [overrideDrafts, setOverrideDrafts] = useState<OverrideDrafts>(
    () =>
      Object.fromEntries(
        scenario.overrides.map((override) => [
          override.productId,
          String(override.parComparableAmount),
        ]),
      ),
  )
  const [overrideFeedback, setOverrideFeedback] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState(scenario.inviteLink?.url ?? '')
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null)
  const [members, setMembers] = useState<BarMember[]>(scenario.members)
  const [memberFeedback, setMemberFeedback] = useState<string | null>(null)

  const allProducts = useMemo(() => {
    const products = new Map<
      string,
      { productId: string; productName: string; upc: string; comparableUnit: ComparableUnit }
    >()

    for (const row of inventoryScenarios.default.rows) {
      products.set(row.productId, {
        productId: row.productId,
        productName: row.productName,
        upc: row.upc,
        comparableUnit: row.comparableUnit,
      })
    }

    for (const override of scenario.overrides) {
      if (!products.has(override.productId)) {
        products.set(override.productId, {
          productId: override.productId,
          productName: override.productName,
          upc: override.upc,
          comparableUnit: override.parComparableUnit,
        })
      }
    }

    return [...products.values()]
  }, [scenario.overrides])

  const filteredProducts = useMemo(() => {
    const normalizedQuery = overrideSearch.trim().toLowerCase()

    if (!normalizedQuery) {
      return allProducts
    }

    return allProducts.filter((product) =>
      `${product.productName} ${product.upc}`.toLowerCase().includes(normalizedQuery),
    )
  }, [allProducts, overrideSearch])

  const handleSaveSettings = () => {
    setSettingsFeedback(
      `Bar settings saved for ${timezone} with a default PAR of ${defaultPar} ${scenario.barSettings.defaultParComparableUnit}.`,
    )
  }

  const handleOverrideDraftChange = (productId: string, nextValue: string) => {
    setOverrideDrafts((current) => ({ ...current, [productId]: nextValue }))
  }

  const handleSaveOverride = (
    productId: string,
    productName: string,
    upc: string,
    comparableUnit: ComparableUnit,
  ) => {
    const rawValue = overrideDrafts[productId] ?? ''
    const parsedValue = Number(rawValue)

    if (!rawValue || Number.isNaN(parsedValue) || parsedValue < 0) {
      setOverrideFeedback('Enter a non-negative PAR value before saving an override.')
      return
    }

    setOverrideMap((current) => ({
      ...current,
      [productId]: {
        productId,
        productName,
        upc,
        parComparableAmount: parsedValue,
        parComparableUnit: comparableUnit,
      },
    }))
    setOverrideFeedback(`${productName} now uses an override PAR of ${parsedValue} ${formatUnit(comparableUnit)}.`)
  }

  const handleRemoveOverride = (productId: string, productName: string) => {
    setOverrideMap((current) => {
      const next = { ...current }
      delete next[productId]
      return next
    })
    setOverrideDrafts((current) => {
      const next = { ...current }
      delete next[productId]
      return next
    })
    setOverrideFeedback(`${productName} now falls back to the bar default PAR.`)
  }

  const handleGenerateInviteLink = () => {
    const nextLink = `https://bartools.app/join/invite-${Date.now()}`
    setInviteLink(nextLink)
    setInviteFeedback('Invite link refreshed for sharing out of band.')
  }

  const handleGrantManager = (userId: string, displayName?: string) => {
    setMembers((current) =>
      current.map((member) =>
        member.userId === userId ? { ...member, canManageBar: true } : member,
      ),
    )
    setMemberFeedback(`${displayName ?? 'This teammate'} can now manage bar settings.`)
  }

  return (
    <Stack gap="lg">
      <Stack gap={2}>
        <Title order={1}>Settings</Title>
        <Text c="dimmed">
          Bar configuration, PAR management, and lightweight team access.
        </Text>
      </Stack>

      {!canManage ? (
        <StatePanel
          description="Non-managers can review context but cannot change bar-wide settings, PAR overrides, or invite access."
          title="Manager permission required"
        />
      ) : null}

      <Paper p="md" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={3}>Bar settings</Title>
            <Badge color={canManage ? 'slate' : 'ink'} radius="sm" variant="light">
              {canManage ? 'Manager view' : 'Restricted view'}
            </Badge>
          </Group>
          <Group align="end" grow>
            <TextInput
              disabled={!canManage}
              label="Timezone"
              onChange={(event) => setTimezone(event.currentTarget.value)}
              value={timezone}
            />
            <TextInput
              disabled={!canManage}
              label="Default PAR"
              onChange={(event) => setDefaultPar(event.currentTarget.value)}
              rightSection={
                <Text size="xs">{scenario.barSettings.defaultParComparableUnit}</Text>
              }
              value={defaultPar}
            />
            <Button color="slate" disabled={!canManage} onClick={handleSaveSettings} radius="sm">
              Save settings
            </Button>
          </Group>
          {settingsFeedback ? (
            <Text c="dimmed" size="sm">
              {settingsFeedback}
            </Text>
          ) : null}
        </Stack>
      </Paper>

      <Paper p="md" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between" wrap="wrap">
            <Title order={3}>Product PAR overrides</Title>
            <TextInput
              label="Search products"
              onChange={(event) => setOverrideSearch(event.currentTarget.value)}
              placeholder="Search by product name or UPC"
              value={overrideSearch}
              w={{ base: '100%', sm: 280 }}
            />
          </Group>

          {overrideFeedback ? (
            <Text c="dimmed" size="sm">
              {overrideFeedback}
            </Text>
          ) : null}

          {filteredProducts.length === 0 ? (
            <StatePanel
              description="No products match the current search."
              title="No matching products"
            />
          ) : (
            <ScrollArea>
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Product</Table.Th>
                    <Table.Th>UPC</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>PAR override</Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredProducts.map((product) => {
                    const override = overrideMap[product.productId]
                    const draftValue = overrideDrafts[product.productId] ?? ''

                    return (
                      <Table.Tr key={product.productId}>
                        <Table.Td>{product.productName}</Table.Td>
                        <Table.Td>{product.upc}</Table.Td>
                        <Table.Td>
                          {override ? (
                            <Badge color="slate" radius="sm" variant="light">
                              Override
                            </Badge>
                          ) : (
                            <Badge color="ink" radius="sm" variant="light">
                              Uses default
                            </Badge>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <TextInput
                            aria-label={`PAR override for ${product.productName}`}
                            disabled={!canManage}
                            onChange={(event) =>
                              handleOverrideDraftChange(
                                product.productId,
                                event.currentTarget.value,
                              )}
                            placeholder={`Uses ${scenario.barSettings.defaultParComparableAmount} ${formatUnit(product.comparableUnit)}`}
                            rightSection={<Text size="xs">{formatUnit(product.comparableUnit)}</Text>}
                            value={draftValue}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs" wrap="nowrap">
                            <Button
                              color="slate"
                              disabled={!canManage}
                              onClick={() =>
                                handleSaveOverride(
                                  product.productId,
                                  product.productName,
                                  product.upc,
                                  product.comparableUnit,
                                )}
                              radius="sm"
                              size="xs"
                              variant="light"
                            >
                              Save override
                            </Button>
                            <Button
                              color="brass"
                              disabled={!canManage || !override}
                              onClick={() =>
                                handleRemoveOverride(product.productId, product.productName)
                              }
                              radius="sm"
                              size="xs"
                              variant="light"
                            >
                              Remove
                            </Button>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    )
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Stack>
      </Paper>

      <Paper p="md" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={3}>Team access</Title>
            <Button
              color="slate"
              disabled={!canManage}
              onClick={handleGenerateInviteLink}
              radius="sm"
              variant="light"
            >
              Generate invite link
            </Button>
          </Group>

          {inviteLink ? (
            <TextInput
              label="Latest invite link"
              readOnly
              value={inviteLink}
            />
          ) : null}

          {inviteFeedback ? (
            <Text c="dimmed" size="sm">
              {inviteFeedback}
            </Text>
          ) : null}

          {memberFeedback ? (
            <Text c="dimmed" size="sm">
              {memberFeedback}
            </Text>
          ) : null}

          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Member</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Access</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {members.map((member) => (
                <Table.Tr key={member.userId}>
                  <Table.Td>{member.displayName ?? 'Unnamed user'}</Table.Td>
                  <Table.Td>{member.email}</Table.Td>
                  <Table.Td>
                    {member.canManageBar ? 'Manager' : 'Staff'}
                  </Table.Td>
                  <Table.Td>
                    <Button
                      color="slate"
                      disabled={!canManage || member.canManageBar}
                      onClick={() =>
                        handleGrantManager(member.userId, member.displayName)
                      }
                      radius="sm"
                      size="xs"
                      variant="light"
                    >
                      Grant manager
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  )
}

function formatUnit(unit: ComparableUnit) {
  return unit === 'ml' ? 'ml' : 'bottles'
}
