import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  fetchOwners,
  fetchHostels,
  createOwner,
  updateOwner,
  deleteOwner,
  type OwnerInput,
} from "../../services/api";
import type { Owner, AdminHostel } from "../types";
import { usePolling } from "../usePolling";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import LiveControls from "../components/LiveControls";
import AdminEmptyState from "../components/AdminEmptyState";
import {
  IconUsers,
  IconPlus,
  IconEdit,
  IconTrash,
  IconMail,
  IconPhone,
} from "../../components/Icons/Icons";
import styles from "../admin.module.css";

function ownerInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function describeError(err: unknown): string {
  const msg =
    err instanceof Error ? err.message : "Something went wrong. Please try again.";
  const lower = msg.toLowerCase();
  if (lower.includes("email") || lower.includes("duplicate")) {
    return "An owner with this email already exists. Please use a different email address.";
  }
  if (lower.includes("required")) {
    return "Please fill in the owner's name, email and phone number.";
  }
  if (lower.includes("could not reach")) {
    return "We couldn't reach the server. Check your connection or make sure the backend is running, then try again.";
  }
  return msg;
}

export default function Owners() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [hostels, setHostels] = useState<AdminHostel[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [query, setQuery] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Owner | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function refresh(showLoading = true) {
    if (showLoading) {
      setState("loading");
      setError(null);
    }
    try {
      const [o, h] = await Promise.all([fetchOwners(), fetchHostels()]);
      setOwners(o);
      setHostels(h);
      setLastUpdated(new Date());
      setState("ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load owners.";
      if (showLoading) {
        setError(message);
        setState("error");
      }
    }
  }

  usePolling(() => refresh(false));

  useEffect(() => {
    refresh();
  }, []);

  const hostelName = useMemo(() => {
    const map = new Map<string, string>();
    hostels.forEach((h) => map.set(h.id, h.name));
    return map;
  }, [hostels]);

  const filtered = owners.filter((o) => {
    const q = query.trim().toLowerCase();
    return !q || o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
  });

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(o: Owner) {
    setEditing(o);
    setFormOpen(true);
  }
  async function handleDelete() {
    if (!confirmId) return;
    await deleteOwner(confirmId);
    setConfirmId(null);
    refresh();
  }

  if (state === "error") {
    const isConnectionError =
      error?.toLowerCase().includes("could not reach") ||
      error?.toLowerCase().includes("backend running");
    return (
      <AdminEmptyState
        variant="error"
        title="We couldn’t load owners"
        text={
          isConnectionError
            ? "We can’t reach the Dabi server right now. Check your connection or make sure the backend is running, then try again."
            : "Something went wrong while loading owners. Please try again."
        }
        detail={!isConnectionError ? error ?? undefined : undefined}
        action={{ label: "Try again", onClick: refresh }}
      />
    );
  }

  return (
    <div>
      <div className={styles.ownersHero}>
        <div className={styles.ownersHeroMain}>
          <span className={styles.ownersHeroEyebrow}>
            <IconUsers size={14} /> People
          </span>
          <h1 className={styles.ownersHeroTitle}>Owners</h1>
          <p className={styles.ownersHeroSub}>
            {owners.length} hostel manager{owners.length === 1 ? "" : "s"} in the
            Dabi network. Keep their details and listings up to date.
          </p>
        </div>
        <div className={styles.ownersHeroActions}>
          <LiveControls
            lastUpdated={lastUpdated}
            loading={state === "loading"}
            onRefresh={() => refresh()}
          />
          <button className="dabi-btn dabi-btn-primary" onClick={openCreate}>
            <IconPlus size={18} />
            Add owner
          </button>
        </div>
        <div className={styles.ownersHeroArt} aria-hidden="true">
          <img
            src="/illustrations/Team-Building-3--Streamline-Brooklyn.webp"
            alt=""
            width={124}
            height={124}
           loading="lazy" decoding="async" />
        </div>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <IconUsers size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search owners…"
          />
        </label>
      </div>

      <p className={styles.resultsLine}>
        Showing <b>{filtered.length}</b> of <b>{owners.length}</b> owners
      </p>

      {state === "loading" ? (
        <div className={styles.ownersGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.ownerSkeleton} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          variant="empty"
          illustration="/illustrations/Astronaut-Riding-Doge--Streamline-Brooklyn.webp"
          title={query ? "No matches found" : "No owners yet"}
          text={
            query
              ? `We couldn't find any owners matching “${query}”. Try a different name or email.`
              : "Owners manage hostels on Dabi. Add your first owner to start assigning listings."
          }
          action={{
            label: (
              <>
                <IconPlus size={16} /> Add owner
              </>
            ),
            onClick: openCreate,
          }}
        />
      ) : (
        <div className={styles.ownersGrid}>
          {filtered.map((o) => {
            const shown = o.hostelIds.slice(0, 3);
            const extra = o.hostelIds.length - shown.length;
            return (
              <div key={o.id} className={styles.ownerTile}>
                <div className={styles.ownerTileHead}>
                  <span className={styles.ownerTileAvatar}>
                    {ownerInitials(o.name)}
                  </span>
                  <div className={styles.ownerTileId}>
                    <span className={styles.ownerTileName}>{o.name}</span>
                    <Badge variant={o.active ? "Active" : "Inactive"}>
                      {o.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className={styles.ownerTileBody}>
                  <div className={styles.ownerTileRow}>
                    <IconMail size={16} />
                    <span className={styles.ownerTileRowText}>{o.email}</span>
                  </div>
                  <div className={styles.ownerTileRow}>
                    <IconPhone size={16} />
                    <span className={styles.ownerTileRowText}>
                      {o.phone || "No phone added"}
                    </span>
                  </div>
                  <div className={styles.ownerTileHostels}>
                    {o.hostelIds.length === 0 ? (
                      <span className={styles.ownerTileFootMeta}>
                        No hostels assigned
                      </span>
                    ) : (
                      <>
                        {shown.map((id) => (
                          <span key={id} className={styles.ownerChip}>
                            {hostelName.get(id) ?? id}
                          </span>
                        ))}
                        {extra > 0 && (
                          <span className={styles.ownerChip}>+{extra} more</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.ownerTileFoot}>
                  <span className={styles.ownerTileFootMeta}>
                    {o.hostelIds.length}{" "}
                    {o.hostelIds.length === 1 ? "hostel" : "hostels"}
                  </span>
                  <div className={styles.rowActions}>
                    <button
                      className={styles.btnIcon}
                      onClick={() => openEdit(o)}
                      aria-label={`Edit ${o.name}`}
                    >
                      <IconEdit size={16} />
                    </button>
                    <button
                      className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                      onClick={() => setConfirmId(o.id)}
                      aria-label={`Delete ${o.name}`}
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {formOpen && (
        <OwnerForm
          initial={editing}
          hostels={hostels}
          onClose={() => setFormOpen(false)}
          onSubmit={async (input) => {
            if (editing) await updateOwner(editing.id, input);
            else await createOwner(input);
            setFormOpen(false);
            refresh();
          }}
        />
      )}

      {confirmId && (
        <Modal title="Remove owner?" onClose={() => setConfirmId(null)}>
          <p className={styles.muted} style={{ marginBottom: 18 }}>
            The owner will be removed and their hostels unassigned. This
            can&rsquo;t be undone.
          </p>
          <div className={styles.formActions}>
            <button className="dabi-btn dabi-btn-ghost" onClick={() => setConfirmId(null)}>
              Cancel
            </button>
            <button className="dabi-btn dabi-btn-danger" onClick={handleDelete}>
              <IconTrash size={16} />
              Remove
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

interface FormProps {
  initial: Owner | null;
  hostels: AdminHostel[];
  onClose: () => void;
  onSubmit: (input: OwnerInput) => void | Promise<void>;
}

function OwnerForm({ initial, hostels, onClose, onSubmit }: FormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [hostelIds, setHostelIds] = useState<string[]>(initial?.hostelIds ?? []);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setHostelIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        active,
        hostelIds,
      });
    } catch (err) {
      setError(describeError(err));
    }
  }

  const emailError = !!error && /email|duplicate/i.test(error);
  const phoneError = !!error && /phone|required/i.test(error);


  return (
    <Modal
      title={initial ? "Edit owner" : "Add owner"}
      onClose={onClose}
      wide
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.ownerFormHero}>
          <span className={styles.ownerFormAvatar}>
            <IconUsers size={24} />
          </span>
          <div>
            <span className={styles.ownerFormEyebrow}>
              {initial ? "Edit profile" : "New person"}
            </span>
            <p className={styles.ownerFormLead}>
              {initial
                ? `Update ${initial.name}'s details and the hostels they look after.`
                : "Add a manager's details and the hostels they'll be responsible for."}
            </p>
          </div>
        </div>

        {error && (
          <div className={styles.formError} role="alert">
            {error}
          </div>
        )}

        <div className={styles.formSection}>
          <div className={styles.formSectionTitle}>Details</div>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="o-name">
                Name
              </label>
              <input
                id="o-name"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="o-phone">
                Phone
              </label>
              <input
                id="o-phone"
                className={`${styles.input} ${phoneError ? styles.inputError : ""}`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              {phoneError && (
                <span className={styles.fieldError}>Phone number is required.</span>
              )}
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="o-email">
              Email
            </label>
            <input
              id="o-email"
              className={`${styles.input} ${emailError ? styles.inputError : ""}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {emailError && (
              <span className={styles.fieldError}>This email is already in use.</span>
            )}
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formSectionTitle}>Managed hostels</div>
          <p className={styles.formSectionHint}>
            Select every hostel this person is responsible for.
          </p>
          <div className={styles.ownerPickGrid}>
            {hostels.map((h) => {
              const on = hostelIds.includes(h.id);
              return (
                <label
                  key={h.id}
                  className={`${styles.ownerPick} ${on ? styles.ownerPickOn : ""}`}
                >
                  <input
                    type="checkbox"
                    className={styles.ownerPickInput}
                    checked={on}
                    onChange={() => toggle(h.id)}
                  />
                  <span className={styles.ownerPickDot} />
                  {h.name}
                </label>
              );
            })}
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formSectionTitle}>Status</div>
          <div className={styles.ownerStatus}>
            <div className={styles.ownerStatusText}>
              <span className={styles.ownerStatusTitle}>Active manager</span>
              <span className={styles.ownerStatusHint}>
                {active
                  ? "Visible and can be assigned hostels."
                  : "Hidden from assignments."}
              </span>
            </div>
            <button
              type="button"
              className={`${styles.ownerSwitch} ${active ? styles.ownerSwitchOn : ""}`}
              onClick={() => setActive(!active)}
              aria-pressed={active}
              aria-label="Toggle active manager"
            >
              <span className={styles.ownerSwitchKnob} />
            </button>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" className="dabi-btn dabi-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="dabi-btn dabi-btn-primary">
            <IconUsers size={16} />
            {initial ? "Save changes" : "Create owner"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
