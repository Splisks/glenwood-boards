// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import type { MenuSections, MenuItem } from "@/lib/menu-store";
import "./admin.css";

type Status = "idle" | "loading" | "saving" | "error" | "saved";

type Theme = {
  id: string;
  label: string;
};

type Group = {
  id: string;
  themeId?: string | null;
};

export default function AdminPage() {
  /* ───────── Menu state ───────── */
  const [menuSections, setMenuSections] = useState<MenuSections>({});
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  /* ───────── Theme state ───────── */
  const [themes, setThemes] = useState<Theme[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState("default");
  const [groupName, setGroupName] = useState("default");
  const [currentThemeId, setCurrentThemeId] = useState<string | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string>("");

  const [themeStatus, setThemeStatus] = useState<
    "idle" | "loading" | "saving" | "error" | "success"
  >("loading");
  const [themeMessage, setThemeMessage] = useState<string | null>(null);

  /* ───────── Collapse state ───────── */
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  function isSectionOpen(sectionKey: string) {
    // default is closed unless explicitly true
    return openSections[sectionKey] === true;
  }

  function toggleSection(sectionKey: string) {
    setOpenSections((prev) => {
      const currentlyOpen = prev[sectionKey] === true;
      return { ...prev, [sectionKey]: !currentlyOpen };
    });
  }

  /* ───────── Load menu ───────── */
  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      setStatus("loading");
      setError(null);
      try {
        const res = await fetch("/api/menu", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setMenuSections(data.menuSections || {});
          setStatus("idle");
        }
      } catch (err: any) {
        console.error("[admin] failed to load menu", err);
        if (!cancelled) {
          setError(err?.message || "Failed to load menu");
          setStatus("error");
        }
      }
    }

    loadMenu();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ───────── Load themes + groups ───────── */
  useEffect(() => {
    let cancelled = false;

    async function loadThemeData() {
      setThemeStatus("loading");
      setThemeMessage(null);

      try {
        const [themesRes, groupsRes] = await Promise.all([
          fetch("/api/themes"),
          fetch("/api/groups"),
        ]);

        const themesData = await themesRes.json();
        const groupsData = await groupsRes.json();

        if (cancelled) return;

        const loadedThemes: Theme[] = themesData.themes || [];
        const loadedGroups: Group[] = groupsData.groups || [];

        setThemes(loadedThemes);
        setGroups(loadedGroups);

        const effectiveGroupId = groupId || "default";
        const group =
          loadedGroups.find((g) => g.id === effectiveGroupId) ||
          loadedGroups[0];

        if (group) {
          setGroupName(group.id);
          setCurrentThemeId(group.themeId || "classic-blue");
          setSelectedThemeId(group.themeId || loadedThemes[0]?.id || "");
        } else {
          setGroupName(effectiveGroupId);
          setCurrentThemeId("classic-blue");
          setSelectedThemeId(loadedThemes[0]?.id || "");
        }

        setThemeStatus("idle");
      } catch (err: any) {
        console.error("[admin] failed to load themes/groups", err);
        if (!cancelled) {
          setThemeStatus("error");
          setThemeMessage("Failed to load themes/groups.");
        }
      }
    }

    loadThemeData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  /* ───────── Save menu ───────── */
  async function handleSaveMenu() {
    setStatus("saving");
    setError(null);

    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuSections }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (err: any) {
      console.error("[admin] save failed", err);
      setError(err?.message || "Failed to save");
      setStatus("error");
    }
  }

  /* ───────── Item helpers (no description) ───────── */

  function updateItem(
    sectionKey: string,
    itemId: string,
    patch: Partial<MenuItem>
  ) {
    setMenuSections((prev) => {
      const section = prev[sectionKey] || [];
      const updatedSection = section.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item
      );
      return {
        ...prev,
        [sectionKey]: updatedSection,
      };
    });
  }

  function addItem(sectionKey: string) {
    setMenuSections((prev) => {
      const section = prev[sectionKey] || [];
      const maxSortOrder =
        section.reduce(
          (m, item) =>
            typeof item.sortOrder === "number"
              ? Math.max(m, item.sortOrder)
              : m,
          0
        ) || 0;

      const newItem: MenuItem = {
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        code: "",
        label: "New item",
        description: "",
        price: "",
        active: true,
        sortOrder: maxSortOrder + 1,
      };

      return {
        ...prev,
        [sectionKey]: [...section, newItem],
      };
    });
  }

  function deleteItem(sectionKey: string, item: MenuItem) {
    const label = (item as any).label || (item as any).code || "this item";
    const ok = window.confirm(
      `Delete "${label}" from the menu? This cannot be undone.`
    );
    if (!ok) return;

    setMenuSections((prev) => {
      const section = prev[sectionKey] || [];
      const updatedSection = section.filter((it) => it.id !== item.id);
      return {
        ...prev,
        [sectionKey]: updatedSection,
      };
    });
  }

  const sectionKeys = Object.keys(menuSections);

  /* ───────── Apply theme ───────── */
  async function handleApplyTheme() {
    const trimmedGroupId = groupId.trim() || "default";
    if (!selectedThemeId) return;

    setThemeStatus("saving");
    setThemeMessage(null);

    try {
      const res = await fetch(
        `/api/groups/${encodeURIComponent(trimmedGroupId)}/theme`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ themeId: selectedThemeId }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update theme");
      }

      const data = await res.json();
      setGroupName(data.group?.id || trimmedGroupId);
      setCurrentThemeId(data.group?.themeId || selectedThemeId);

      setThemeStatus("success");
      setThemeMessage(
        `Theme updated to "${selectedThemeId}". Screens will refresh automatically.`
      );
    } catch (err: any) {
      console.error("[admin] theme update failed", err);
      setThemeStatus("error");
      setThemeMessage(err?.message || "Error updating theme.");
    }
  }

  /* ───────── Render ───────── */
  return (
    <div
      className="admin-root"
      style={{
        padding: "1.5rem",
        maxWidth: 960,
        margin: "0 auto",
        color: "#fff",
        background: "#004a9f",
        minHeight: "100vh",
        fontFamily:
          '"BD_Cartoon_Shout", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Top header */}
      <header className="admin-header">
        <div className="admin-header-text">
          <h1
            style={{
              marginBottom: "0.25rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            GLENWOOD BOARD ADMIN
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "0.95rem",
              textTransform: "none",
            }}
          >
            ADJUST THEME AND MENU PRICING<br />SCREENS AUTO-REFRESH FROM THE SERVER
          </p>
        </div>

        {/* Logout button */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="admin-logout-btn"
          style={{
            padding: "0.35rem 0.9rem",
            borderRadius: 999,
            border: "none",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            background: "rgba(15,23,42,0.9)",
            color: "#e5e7eb",
            boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
          }}
        >
          Log out
        </button>
      </header>

      {/* Theme Admin card */}
      <section
        className="admin-theme-card"
        style={{
          background: "#1f2937",
          borderRadius: 12,
          padding: "1.25rem 1.5rem",
          boxShadow: "0 18px 40px rgba(0, 0, 0, 0.45)",
          border: "1px solid #374151",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        {/* Theme section header with toggle - now clickable row */}
        <div
          className="admin-theme-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            marginBottom: isThemeOpen ? "0.25rem" : 0,
            cursor: "pointer",
          }}
          onClick={() => setIsThemeOpen((v) => !v)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsThemeOpen((v) => !v);
            }
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              textAlign: "left",
              flex: 1,
            }}
          >
            THEME MANAGEMENT
          </h2>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsThemeOpen((v) => !v);
            }}
            aria-label={
              isThemeOpen ? "Collapse theme panel" : "Expand theme panel"
            }
            className="admin-toggle-btn"
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.7)",
              background: "rgba(15,23,42,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: isThemeOpen ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.18s ease-out",
                fontSize: 13,
                lineHeight: 1,
                color: "#ffffff",
              }}
            >
              ▸
            </span>
          </button>
        </div>

        {isThemeOpen && (
          <>
            <p
              style={{
                margin: "0.4rem 0 0.9rem",
                fontSize: 13,
                color: "#9ca3af",
                textTransform: "none",
              }}
            >
              Themes can be automatically scheduled throughout the year or
              applied manually. Manually selecting a theme will override the
              automatic schedule until reset to the default theme.
            </p>

            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 6,
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  padding: "2px 10px",
                  fontSize: 11,
                  borderRadius: 999,
                  border: "1px solid #4b5563",
                  color: "#9ca3af",
                  marginTop: 10,
                  marginBottom: 10,
                  background: "rgba(15,23,42,0.9)",
                }}
              >
                Current theme:{" "}
                <strong>{currentThemeId || "loading…"}</strong>
              </span>
            </div>

            <div
              style={{
                marginBottom: 14,
                marginTop: 10,
                textAlign: "left",
              }}
            >
              <label
                htmlFor="themeSelect"
                style={{
                  display: "block",
                  fontSize: 13,
                  marginBottom: 4,
                  marginTop: 10,
                  color: "#d1d5db",
                }}
              >
                Select theme
              </label>
              <select
                id="themeSelect"
                value={selectedThemeId}
                onChange={(e) => setSelectedThemeId(e.target.value)}
                disabled={themes.length === 0 || themeStatus === "loading"}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #4b5563",
                  background: "#111827",
                  color: "#e5e7eb",
                  fontSize: 14,
                  outline: "none",
                }}
              >
                {themes.length === 0 ? (
                  <option value="">Loading themes…</option>
                ) : (
                  themes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} ({t.id})
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              onClick={handleApplyTheme}
              disabled={
                themeStatus === "saving" ||
                themeStatus === "loading" ||
                !selectedThemeId
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 999,
                border: "none",
                fontWeight: 600,
                fontSize: 14,
                cursor:
                  themeStatus === "saving" || themeStatus === "loading"
                    ? "default"
                    : "pointer",
                background: "linear-gradient(135deg, #3b82f6, #22c55e)",
                color: "white",
                boxShadow:
                  themeStatus === "saving" || themeStatus === "loading"
                    ? "none"
                    : "0 8px 20px rgba(37, 99, 235, 0.45)",
                opacity:
                  themeStatus === "saving" || themeStatus === "loading"
                    ? 0.6
                    : 1,
              }}
            >
              {themeStatus === "saving"
                ? "Applying…"
                : themeStatus === "loading"
                ? "Loading…"
                : "Apply theme"}
            </button>

            {themeMessage && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color:
                    themeStatus === "error"
                      ? "#fca5a5"
                      : themeStatus === "success"
                      ? "#6ee7b7"
                      : "#e5e7eb",
                }}
              >
                {themeMessage}
              </div>
            )}
          </>
        )}
      </section>

      {/* Menu Admin section */}
      <section>
        <div
          style={{
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          <button
            onClick={handleSaveMenu}
            disabled={status === "saving" || status === "loading"}
            style={{
              padding: "0.6rem 1.6rem",
              fontSize: "0.95rem",
              borderRadius: "999px",
              border: "none",
              cursor:
                status === "saving" || status === "loading"
                  ? "default"
                  : "pointer",
              background: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
              color: "#fff",
              fontWeight: 600,
              boxShadow:
                status === "saving" || status === "loading"
                  ? "none"
                  : "0 8px 20px rgba(37, 99, 235, 0.4)",
              opacity:
                status === "saving" || status === "loading" ? 0.7 : 1,
            }}
          >
            {status === "saving"
              ? "Saving…"
              : status === "saved"
              ? "Saved"
              : "Save menu changes"}
          </button>

          {status === "loading" && (
            <span style={{ marginLeft: "0.75rem" }}>Loading menu…</span>
          )}

          {status === "error" && (
            <span style={{ marginLeft: "0.75rem", color: "#ffdddd" }}>
              {error}
            </span>
          )}
        </div>

        {sectionKeys.length === 0 && status !== "loading" && (
          <div style={{ textAlign: "center" }}>No sections found in menu.</div>
        )}

        <div style={{ display: "grid", gap: "1rem" }}>
          {sectionKeys.map((sectionKey) => {
            const items = (menuSections[sectionKey] || []).slice().sort(
              (a, b) =>
                (a.sortOrder ?? 0) === (b.sortOrder ?? 0)
                  ? a.label.localeCompare(b.label)
                  : (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
            );

            const open = isSectionOpen(sectionKey);
            const sectionLabel = sectionKey.replace(/_/g, " ");

            return (
              <div
                key={sectionKey}
                className="admin-section-card"
                style={{
                  background: "rgba(0, 0, 0, 0.25)",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                }}
              >
                {/* Category header with toggle - now clickable row */}
                <div
                  className="admin-section-header"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    marginBottom: open ? "0.75rem" : 0,
                    cursor: "pointer",
                  }}
                  onClick={() => toggleSection(sectionKey)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleSection(sectionKey);
                    }
                  }}
                >
                  <h2
                    style={{
                      marginTop: 0,
                      marginBottom: 0,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      textAlign: "left",
                      flex: 1,
                    }}
                  >
                    {sectionLabel}
                  </h2>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection(sectionKey);
                    }}
                    aria-label={
                      open
                        ? `Collapse ${sectionLabel} section`
                        : `Expand ${sectionLabel} section`
                    }
                    className="admin-toggle-btn"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.7)",
                      background: "rgba(15,23,42,0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        transform: open ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.18s ease-out",
                        fontSize: 12,
                        lineHeight: 1,
                        color: "#ffffff",
                      }}
                    >
                      ▸
                    </span>
                  </button>
                </div>

                {open && (
                  <>
                    <div
                      className="admin-items-grid"
                      style={{ display: "grid", gap: "0.6rem" }}
                    >
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="admin-item-row"
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "minmax(0, 2.4fr) minmax(0, 1.6fr) auto",
                            columnGap: "0.5rem",
                            rowGap: "0.3rem",
                            alignItems: "center",
                          }}
                        >
                          {/* Name */}
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) =>
                              updateItem(sectionKey, item.id, {
                                label: e.target.value,
                              })
                            }
                            className="admin-item-name"
                            style={{
                              width: "100%",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "0.5rem",
                              border: "1px solid rgba(255,255,255,0.3)",
                              background: "rgba(255,255,255,0.1)",
                              color: "#fff",
                            }}
                            placeholder="Item name"
                          />

                          {/* Price */}
                          <input
                            type="text"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(sectionKey, item.id, {
                                price: e.target.value,
                              })
                            }
                            className="admin-item-price"
                            style={{
                              width: "100%",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "0.5rem",
                              border: "1px solid rgba(255,255,255,0.3)",
                              background: "rgba(255,255,255,0.1)",
                              color: "#fff",
                            }}
                            placeholder="Price"
                          />

                          {/* Right side controls */}
                          <div className="admin-item-controls">
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                fontSize: "0.85rem",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={(item as any).active !== false}
                                onChange={(e) =>
                                  updateItem(sectionKey, item.id, {
                                    active: e.target.checked,
                                  } as any)
                                }
                              />
                              ACTIVE
                            </label>

                            <button
                              type="button"
                              onClick={() => deleteItem(sectionKey, item)}
                              className="admin-delete-btn"
                              style={{
                                padding: "0.2rem 0.7rem",
                                borderRadius: 999,
                                border: "1px solid rgba(248,113,113,0.6)",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                background: "rgba(239,68,68,0.14)",
                                color: "#fecaca",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add item */}
                    <button
                      type="button"
                      onClick={() => addItem(sectionKey)}
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.35rem 0.9rem",
                        borderRadius: 999,
                        border: "1px dashed rgba(255,255,255,0.6)",
                        background: "transparent",
                        color: "#e5e7eb",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      + Add item
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
