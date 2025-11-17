"use client";

import { useEffect, useState } from "react";
import type { MenuSections, MenuItem } from "@/lib/menu-store";
import "./admin.css";

type Status = "idle" | "loading" | "saving" | "error" | "saved";

// Theme types based on /api/themes and /api/groups responses
type Theme = {
  id: string;
  label: string;
};

type Group = {
  id: string;
  themeId?: string | null;
};

export default function AdminPage() {
  /* ───────────────────── Menu state ───────────────────── */
  const [menuSections, setMenuSections] = useState<MenuSections>({});
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  /* ───────────────────── Theme state ───────────────────── */
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

  /* ───────────────────── Load menu ───────────────────── */
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

  /* ───────────────────── Load themes + groups ───────────────────── */
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

        // Match logic from old admin.html:
        // - use groupId from input (default)
        // - fall back to first group if not found
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

  /* ───────────────────── Save menu ───────────────────── */
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

  const sectionKeys = Object.keys(menuSections);

  /* ───────────────────── Apply theme ───────────────────── */
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

  /* ───────────────────── Render ───────────────────── */
  return (
    <div
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
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>GLENWOOD BOARD ADMIN</h1>
        <p style={{ margin: 0, fontSize: "0.95rem" }}>
          Adjust theme and menu pricing. Screens auto-refresh from the server.
        </p>
      </header>

      {/* Theme Admin card (based closely on old admin.html) */}
      <section
        style={{
          background: "#1f2937",
          borderRadius: 12,
          padding: "1.25rem 1.5rem",
          boxShadow: "0 18px 40px rgba(0, 0, 0, 0.45)",
          border: "1px solid #374151",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ margin: "0 0 0.25rem", fontSize: 20 }}>THEME ADMIN</h2>
        <p
          style={{
            margin: "0 0 0.9rem",
            fontSize: 13,
            color: "#9ca3af",
          }}
        >
          Themes are automatically schedule to run throughout the year
        </p>

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              padding: "2px 8px",
              fontSize: 11,
              borderRadius: 999,
              border: "1px solid #4b5563",
              color: "#9ca3af",
              marginTop: 10,
            }}
          >
            Current theme:{" "}
            <strong>{currentThemeId || "loading\u2026"}</strong>
          </span>
        </div>


        <div style={{ marginBottom: 14 }}>
          <label
            htmlFor="themeSelect"
            style={{
              display: "block",
              fontSize: 13,
              marginBottom: 4,
              marginTop: 20,
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
            background:
              "linear-gradient(135deg, #3b82f6, #22c55e)", // blue → green
            color: "white",
            boxShadow:
              themeStatus === "saving" || themeStatus === "loading"
                ? "none"
                : "0 8px 20px rgba(37, 99, 235, 0.45)",
            opacity:
              themeStatus === "saving" || themeStatus === "loading" ? 0.6 : 1,
          }}
        >
          {themeStatus === "saving"
            ? "Applying…"
            : themeStatus === "loading"
            ? "Loading…"
            : "Apply Theme"}
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
      </section>

      {/* Menu Admin section (your original page.tsx content) */}
      <section>
        <div style={{ marginBottom: "1rem" }}>
          <button
            onClick={handleSaveMenu}
            disabled={status === "saving" || status === "loading"}
            style={{
              padding: "0.5rem 1.25rem",
              fontSize: "1rem",
              borderRadius: "999px",
              border: "none",
              cursor:
                status === "saving" || status === "loading"
                  ? "default"
                  : "pointer",
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
          <div>No sections found in menu.</div>
        )}

        <div style={{ display: "grid", gap: "1rem" }}>
          {sectionKeys.map((sectionKey) => {
            const items = menuSections[sectionKey] || [];
            return (
              <div
                key={sectionKey}
                style={{
                  background: "rgba(0, 0, 0, 0.25)",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                }}
              >
                <h2 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
                  {sectionKey.replace(/_/g, " ")}
                </h2>

                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "minmax(0, 3fr) minmax(0, 1fr) auto",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) =>
                          updateItem(sectionKey, item.id, {
                            label: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.5rem",
                          border: "1px solid rgba(255,255,255,0.3)",
                          background: "rgba(255,255,255,0.1)",
                          color: "#fff",
                        }}
                      />

                      <input
                        type="text"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(sectionKey, item.id, {
                            price: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.5rem",
                          border: "1px solid rgba(255,255,255,0.3)",
                          background: "rgba(255,255,255,0.1)",
                          color: "#fff",
                        }}
                      />

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
                          checked={item.active !== false}
                          onChange={(e) =>
                            updateItem(sectionKey, item.id, {
                              active: e.target.checked,
                            })
                          }
                        />
                        Active
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
