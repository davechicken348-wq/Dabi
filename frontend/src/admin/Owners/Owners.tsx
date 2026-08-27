import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type CSSProperties,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchOwners,
  createOwner,
  updateOwner,
  deleteOwner,
  type OwnerInput,
} from "../../services/api";
import type { Owner } from "../types";
import { usePolling } from "../usePolling";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import LiveControls from "../components/LiveControls";
import AdminEmptyState from "../components/AdminEmptyState";
import {
  IconUsers,
  IconPlus,
  IconTrash,
  IconMail,
  IconUser,
  IconPhone,
  IconCheck,
  IconChevronDown,
  IconSearch,
  IconSliders,
  IconArrow,
  IconRefresh,
} from "../../components/Icons/Icons";
import styles from "../admin.module.css";
import OwnerSection from "./OwnerSection";

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

/* Column model — mirrors the Supabase Users data grid layout. */
type ColumnKey = "uid" | "name" | "email" | "phone" | "hostels" | "status";

const COLUMNS: { key: ColumnKey; label: string; always: boolean; width: string }[] = [
  { key: "uid", label: "UID", always: true, width: "150px" },
  { key: "name", label: "Display name", always: true, width: "minmax(180px, 1.6fr)" },
  { key: "email", label: "Email", always: true, width: "minmax(200px, 1.8fr)" },
  { key: "phone", label: "Phone", always: false, width: "160px" },
  { key: "hostels", label: "Hostels", always: false, width: "150px" },
  { key: "status", label: "Status", always: false, width: "130px" },
];

const SEARCH_FIELDS = [
  { value: "name", label: "Name" },
  { value: "email", label: "Email address" },
  { value: "phone", label: "Phone number" },
] as const;

type SearchField = (typeof SEARCH_FIELDS)[number]["value"];

const SORTS = [
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "hostels", label: "Hostels" },
  { value: "newest", label: "Date joined (newest)" },
  { value: "oldest", label: "Date joined (oldest)" },
] as const;

type SortKey = (typeof SORTS)[number]["value"];

export default function Owners() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [query, setQuery] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("email");
  const [sort, setSort] = useState<SortKey>("name");
  const [hidden, setHidden] = useState<Set<ColumnKey>>(new Set());

  const [searchMenu, setSearchMenu] = useState(false);
  const [columnsMenu, setColumnsMenu] = useState(false);
  const [sortMenu, setSortMenu] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Owner | null>(null);

  async function refresh(showLoading = true) {
    if (showLoading) {
      setState("loading");
      setError(null);
    }
    try {
      const o = await fetchOwners();
      setOwners(o);
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

  const [params, setParams] = useSearchParams();
  useEffect(() => {
    if (params.get("new") === "1") {
      setEditing(null);
      setFormOpen(true);
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [params, setParams, setEditing, setFormOpen]);

  const visibleColumns = useMemo(
    () => COLUMNS.filter((c) => c.always || !hidden.has(c.key)),
    [hidden],
  );

  const gridTemplate = visibleColumns.map((c) => c.width).join(" ");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = owners.filter((o) => {
      if (!q) return true;
      const field = o[searchField];
      return field?.toLowerCase().includes(q) ?? false;
    });
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case "email":
          return a.email.localeCompare(b.email);
        case "hostels":
          return b.hostelIds.length - a.hostelIds.length;
        case "newest":
          return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        case "oldest":
          return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [owners, query, searchField, sort]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(o: Owner) {
    setEditing(o);
    setFormOpen(true);
  }
  async function handleDelete(id: string) {
    await deleteOwner(id);
    setFormOpen(false);
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

  const searchLabel =
    SEARCH_FIELDS.find((f) => f.value === searchField)?.label ?? "Email address";
  const sortLabel = SORTS.find((s) => s.value === sort)?.label ?? "Name";

  return (
    <OwnerSection title="Owner management">
      <div className={styles.sbPage}>
        <div className={styles.sbHeader}>
          <h2 className={styles.sbTitle}>Owners</h2>
          <div className={styles.sbHeaderActions} />
        </div>

      <div className={styles.sbToolbar}>
        <div className={styles.sbSearchGroup}>
          <div className={styles.sbColWrap}>
            <button
              type="button"
              className={styles.sbColSelect}
              onClick={() => setSearchMenu((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={searchMenu}
            >
              <span>{searchLabel}</span>
              <IconChevronDown size={14} />
            </button>
            {searchMenu && (
              <>
                <button
                  className={styles.scrim}
                  style={{ position: "fixed", inset: 0, zIndex: 35 }}
                  aria-label="Close menu"
                  onClick={() => setSearchMenu(false)}
                />
                <div className={`${styles.dropdown} ${styles.sbMenu}`}>
                  {SEARCH_FIELDS.map((f) => (
                    <button
                      key={f.value}
                      className={`${styles.menuItem} ${
                        searchField === f.value ? styles.menuItemActive : ""
                      }`}
                      onClick={() => {
                        setSearchField(f.value);
                        setSearchMenu(false);
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className={styles.sbSearchDivider} />
          <div className={styles.sbSearchField}>
            <IconSearch size={15} />
            <input
              className={styles.sbSearchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search by ${searchLabel.toLowerCase()}`}
            />
          </div>
        </div>

        <div className={styles.sbToolbarDivider} />

        <div className={styles.sbMenuWrap}>
          <button
            type="button"
            className={styles.sbToolBtn}
            onClick={() => setColumnsMenu((v) => !v)}
            aria-haspopup="true"
            aria-expanded={columnsMenu}
          >
            <IconSliders size={14} />
            <span>All columns</span>
            <IconChevronDown size={14} />
          </button>
          {columnsMenu && (
            <>
              <button
                className={styles.scrim}
                style={{ position: "fixed", inset: 0, zIndex: 35 }}
                aria-label="Close menu"
                onClick={() => setColumnsMenu(false)}
              />
              <div className={`${styles.dropdown} ${styles.sbMenu}`}>
                <div className={styles.menuDivider} style={{ margin: "6px 6px 0" }} />
                {COLUMNS.filter((c) => !c.always).map((c) => {
                  const on = !hidden.has(c.key);
                  return (
                    <button
                      key={c.key}
                      className={styles.menuItem}
                      onClick={() =>
                        setHidden((prev) => {
                          const next = new Set(prev);
                          if (on) next.add(c.key);
                          else next.delete(c.key);
                          return next;
                        })
                      }
                    >
                      <span
                        className={`${styles.sbCheck} ${on ? styles.sbCheckOn : ""}`}
                      />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className={styles.sbMenuWrap}>
          <button
            type="button"
            className={styles.sbToolBtn}
            onClick={() => setSortMenu((v) => !v)}
            aria-haspopup="true"
            aria-expanded={sortMenu}
          >
            <IconArrow size={14} />
            <span>Sorted by {sortLabel}</span>
            <IconChevronDown size={14} />
          </button>
          {sortMenu && (
            <>
              <button
                className={styles.scrim}
                style={{ position: "fixed", inset: 0, zIndex: 35 }}
                aria-label="Close menu"
                onClick={() => setSortMenu(false)}
              />
              <div className={`${styles.dropdown} ${styles.sbMenu}`}>
                {SORTS.map((s) => (
                  <button
                    key={s.value}
                    className={`${styles.menuItem} ${
                      sort === s.value ? styles.menuItemActive : ""
                    }`}
                    onClick={() => {
                      setSort(s.value);
                      setSortMenu(false);
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
          </>
        )}
        </div>

        <span className={styles.sbSpacer} />

        <LiveControls
          lastUpdated={lastUpdated}
          loading={state === "loading"}
          onRefresh={() => refresh()}
        />
        <button className={styles.sbAddBtn} onClick={openCreate}>
          <IconPlus size={16} />
          <span>Add owner</span>
          <IconChevronDown size={14} />
        </button>
      </div>

      <div className={styles.sbScroll}>
        <div className={styles.sbGrid}>
          <div className={styles.sbGridHeader} style={{ gridTemplateColumns: gridTemplate }}>
            {visibleColumns.map((c) => (
              <div key={c.key} className={styles.sbTh}>
                {c.label}
              </div>
            ))}
          </div>

          {state === "loading" ? (
            <div className={styles.sbBody}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={styles.sbRow}
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  {visibleColumns.map((c) => (
                    <div key={c.key} className={styles.sbTd}>
                      <div className={styles.sbSkeleton} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.sbEmpty}>
              <span className={styles.sbEmptyIcon}>
                <IconUsers size={28} />
              </span>
              <p className={styles.sbEmptyTitle}>
                {query ? "No owners match your search" : "No owners in your network"}
              </p>
              <p className={styles.sbEmptyText}>
                {query
                  ? `We couldn't find any owners matching “${query}”. Try a different ${searchLabel.toLowerCase()}.`
                  : "There are currently no owners managing hostels on Dabi."}
              </p>
            </div>
          ) : (
            <div className={styles.sbBody}>
              {filtered.map((o) => (
                <div
                  key={o.id}
                  className={styles.sbRow}
                  style={{ gridTemplateColumns: gridTemplate }}
                  onClick={() => openEdit(o)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") openEdit(o);
                  }}
                >
                  {visibleColumns.map((c) => (
                    <div key={c.key} className={styles.sbTd}>
                      {renderCell(c.key, o, styles)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.sbFooter}>
        <span>
          Showing <b>{filtered.length}</b> of <b>{owners.length}</b> owners
        </span>
        {state === "loading" && (
          <span className={styles.sbLoading}>
            <IconRefresh size={13} className={styles.sbSpin} />
            Loading…
          </span>
        )}
      </div>

      {formOpen && (
        <OwnerForm
          initial={editing}
          onClose={() => setFormOpen(false)}
          onSubmit={async (input) => {
            if (editing) await updateOwner(editing.id, input);
            else await createOwner(input);
            setFormOpen(false);
            refresh();
          }}
          onDelete={editing ? () => handleDelete(editing.id) : undefined}
        />
      )}
      </div>
    </OwnerSection>
  );
}

function renderCell(
  key: ColumnKey,
  o: Owner,
  styles: Record<string, string>,
) {
  switch (key) {
    case "uid":
      return (
        <span className={styles.sbUid} title={o.id}>
          {o.id.slice(0, 8)}
        </span>
      );
    case "name":
      return (
        <div className={styles.sbName}>
          <span
            className={styles.sbAvatar}
            style={{ "--av": "var(--adm-gold)" } as CSSProperties}
          >
            {ownerInitials(o.name)}
          </span>
          <span className={styles.sbNameText}>{o.name}</span>
        </div>
      );
    case "email":
      return (
        <span className={styles.sbEmail}>
          <IconMail size={14} />
          {o.email}
        </span>
      );
    case "phone":
      return <span className={styles.sbMuted}>{o.phone || "—"}</span>;
    case "hostels":
      return (
        <span className={styles.sbMuted}>
          {o.hostelIds.length === 0
            ? "No hostels"
            : `${o.hostelIds.length} ${o.hostelIds.length === 1 ? "hostel" : "hostels"}`}
        </span>
      );
    case "status":
      return (
        <Badge variant={o.active ? "Active" : "Inactive"}>
          {o.active ? "Active" : "Inactive"}
        </Badge>
      );
    default:
      return null;
  }
}

interface FormProps {
  initial: Owner | null;
  onClose: () => void;
  onSubmit: (input: OwnerInput) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

function OwnerForm({ initial, onClose, onSubmit, onDelete }: FormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        active,
        hostelIds: initial?.hostelIds ?? [],
      });
    } catch (err) {
      setError(describeError(err));
    }
  }

  const emailError = !!error && /email|duplicate/i.test(error);
  const phoneError = !!error && /phone|required/i.test(error);

  return (
    <Modal
      title={initial ? "Edit owner" : "Create a new owner"}
      onClose={onClose}
      narrow
    >
      <form className={styles.ownerForm} onSubmit={handleSubmit}>
        <div className={styles.ownerFormDivider} />
        <div className={styles.ownerFormBody}>
          {error && (
            <div className={styles.formError} role="alert">
              {error}
            </div>
          )}

          <div className={styles.ownerField}>
            <label className={styles.ownerFieldLabel} htmlFor="o-name">
              Name
            </label>
            <div className={styles.ownerFieldWrap}>
              <span className={styles.ownerFieldIcon}>
                <IconUser size={18} />
              </span>
              <input
                id="o-name"
                className={`${styles.input} ${styles.ownerInputIcon}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ama Owusu"
                required
              />
            </div>
          </div>

          <div className={styles.ownerField}>
            <label className={styles.ownerFieldLabel} htmlFor="o-phone">
              Phone number
            </label>
            <div className={styles.ownerFieldWrap}>
              <span className={styles.ownerFieldIcon}>
                <IconPhone size={18} />
              </span>
              <input
                id="o-phone"
                className={`${styles.input} ${styles.ownerInputIcon} ${
                  phoneError ? styles.inputError : ""
                }`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233 00 000 0000"
                required
              />
            </div>
            {phoneError && (
              <span className={styles.fieldError}>Phone number is required.</span>
            )}
          </div>

          <div className={styles.ownerField}>
            <label className={styles.ownerFieldLabel} htmlFor="o-email">
              Email address
            </label>
            <div className={styles.ownerFieldWrap}>
              <span className={styles.ownerFieldIcon}>
                <IconMail size={18} />
              </span>
              <input
                id="o-email"
                type="email"
                className={`${styles.input} ${styles.ownerInputIcon} ${
                  emailError ? styles.inputError : ""
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.com"
                required
              />
            </div>
            {emailError && (
              <span className={styles.fieldError}>This email is already in use.</span>
            )}
          </div>

          <div className={styles.ownerCheckRow}>
            <button
              type="button"
              className={`${styles.ownerCheck} ${active ? styles.ownerCheckOn : ""}`}
              onClick={() => setActive(!active)}
              aria-pressed={active}
              aria-label="Toggle active owner"
            >
              <IconCheck size={14} />
            </button>
            <label
              className={styles.ownerCheckLabel}
              onClick={() => setActive(!active)}
            >
              Active owner
            </label>
          </div>
          <p className={styles.ownerHelper}>
            {active
              ? "Active owners are visible in the owners list."
              : "Inactive owners are hidden from the owners list."}
          </p>

          {onDelete && (
            <button
              type="button"
              className={`${styles.ownerBtn} ${styles.ownerBtnDanger} ${styles.ownerDelete}`}
              onClick={onDelete}
            >
              <IconTrash size={16} />
              Remove owner
            </button>
          )}

          <button
            type="submit"
            className={`${styles.ownerBtn} ${styles.ownerBtnPrimary} ${styles.ownerBtnBlock}`}
          >
            {initial ? "Save changes" : "Create owner"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
