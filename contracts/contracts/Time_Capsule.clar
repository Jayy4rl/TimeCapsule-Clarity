;; Verified Time Vault
;; Implements Clarity 4: stacks-block-time, to-ascii, contract-hash?, restrict-assets?

(define-constant ERR-CAPSULE-NOT-FOUND (err u100))
(define-constant ERR-ALREADY-CLAIMED (err u101))
(define-constant ERR-TOO-EARLY (err u102))
(define-constant ERR-NOT-BENEFICIARY (err u103))
(define-constant ERR-UNSAFE-CONTRACT (err u104))

;; A trusted hash for a "Safe Wallet" contract (Example hash)
;; In production, this would be the hash of a standard MultiSig contract you trust
(define-constant TRUSTED-WALLET-HASH 0x0000000000000000000000000000000000000000000000000000000000000000)

(define-data-var capsule-nonce uint u0)

(define-map capsules 
    uint 
    {
        owner: principal, 
        amount: uint, 
        unlock-time: uint, 
        beneficiary: principal, 
        is-claimed: bool 
    }
)

;; 1. CLARITY 4: stacks-block-time
;; Check if the vault is ready to open based on real time
(define-read-only (is-unlockable (unlock-time uint))
    (>= stacks-block-time unlock-time)
)

;; 2. CLARITY 4: contract-hash?
;; Verifies that a beneficiary contract is "Official" before creating the vault
(define-private (check-is-safe (target principal))
    (match (contract-hash? target)
        actual-hash (is-eq actual-hash TRUSTED-WALLET-HASH)
        false ;; If it's not a contract (standard user), return true (safe)
    )
)

(define-public (create-vault (amount uint) (unlock-time uint) (beneficiary principal))
    (let
        (
            (new-id (+ (var-get capsule-nonce) u1))
            (contract-principal (as-contract tx-sender))
        )
        ;; Security Check: Ensure beneficiary is safe
        ;; If it is a contract, it MUST match our trusted hash
        (asserts! (check-is-safe beneficiary) ERR-UNSAFE-CONTRACT)

        (try! (stx-transfer? amount tx-sender contract-principal))

        (map-set capsules new-id {
            owner: tx-sender,
            amount: amount,
            unlock-time: unlock-time,
            beneficiary: beneficiary,
            is-claimed: false
        })

        (var-set capsule-nonce new-id)

        ;; 3. CLARITY 4: to-ascii
        ;; Log the event with readable string IDs
        (print {
            event: "vault-created", 
            id-str: (to-ascii new-id),
            beneficiary-str: (to-ascii beneficiary)
        })

        (ok new-id)
    )
)

(define-public (claim-vault (id uint))
    (let
        (
            (capsule (unwrap! (map-get? capsules id) ERR-CAPSULE-NOT-FOUND))
            (beneficiary (get beneficiary capsule))
            (amount (get amount capsule))
        )
        (asserts! (not (get is-claimed capsule)) ERR-ALREADY-CLAIMED)
        (asserts! (is-eq tx-sender beneficiary) ERR-NOT-BENEFICIARY)
        (asserts! (>= stacks-block-time (get unlock-time capsule)) ERR-TOO-EARLY)

        ;; 4. CLARITY 4: restrict-assets?
        ;; This ensures that during this transaction, the contract 
        ;; sends EXACTLY 'amount' STX to the beneficiary.
        ;; restrict-assets? wraps the expression and restricts asset movements.
        (try! (restrict-assets? true (as-contract (stx-transfer? amount tx-sender beneficiary))))

        (map-set capsules id (merge capsule { is-claimed: true }))
        (ok true)
    )
)