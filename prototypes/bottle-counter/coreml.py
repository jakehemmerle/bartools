"""CoreML compute-unit pinning so Ultralytics-loaded .mlpackage actually hits the ANE."""
from __future__ import annotations


def force_coreml_ane() -> None:
    """Force CoreML MLModel loads to use the Apple Neural Engine.

    Ultralytics' AutoBackend loads .mlpackage without specifying compute_units,
    which defaults to ALL. On this machine the GPU/MPSGraph compile path
    asserts ('MLIR pass manager failed'), and runtime silently falls back to
    CPU (~29 ms/frame). Forcing CPU_AND_NE engages the ANE directly (~17 ms).
    """
    import coremltools as ct
    _Orig = ct.models.MLModel

    def _patched(*args, **kwargs):
        kwargs.setdefault("compute_units", ct.ComputeUnit.CPU_AND_NE)
        return _Orig(*args, **kwargs)

    ct.models.MLModel = _patched
