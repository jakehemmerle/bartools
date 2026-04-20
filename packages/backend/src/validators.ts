import { z } from 'zod';

const UUID_HEX_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const uuid = () => z.string().regex(UUID_HEX_RE, 'invalid_uuid');
