## 2024-07-25 - The Phantom Import

**Learning:** Reviewer feedback can sometimes be misleading or based on a cached state. I received repeated feedback that a `useMemo` import was missing, even after verifying it was present in the file. This caused a significant delay. While the feedback was ultimately incorrect, it highlights the absolute necessity of triple-checking dependencies and imports, as they are a common source of error.

**Action:** When a reviewer flags a simple, verifiable issue like a missing import, and I am certain it's present, I will not simply re-run tests. Instead, I will:
1.  **Forcefully overwrite the file:** Use `overwrite_file_with_block` to eliminate any possibility of a state mismatch.
2.  **Read the file back:** Immediately after overwriting, read the file to get a "ground truth" confirmation.
3.  **Trust but Verify:** Treat reviewer feedback as a strong signal, but always verify its accuracy against the current state of the code. If a discrepancy is found, document it and proceed with the correct code.
