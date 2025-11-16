// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import "./admin.css";

type MenuItem = {
  id: string;
  label: string;
  price: string;
  active?: boolean;
};

type MenuSections = Record<string, MenuItem[]>;

type StatusKind = "" | "ok" | "err";

function uid() {
  return (
    Math.random().toString(36).slice(2, 8) +
    Date.now().toString(36).slice(-4)
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [menuSections, setMenuSections] = useState<MenuSections>({});
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");
  const [statusKind, setStatusKind] = useState<StatusKind>("");

  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadMenu() {
      try {
        setStatusText("");
        setStatusKind("");
        const res = await fetch("/api/menu");
        const data = await res.json();
        const sections: MenuSections = data.menuSections || {};
        setMenuSections(sections);

        const firstKey = Object.keys(sections)[0] ?? null;
        setCurrentSectionId(firstKey);
      } catch (err) {
        console.error(err);
        setStatusText("Failed to load menu data.");
        setStatusKind("err");
      }
    }

    loadMenu();
  }, [status]);

  const currentItems: MenuItem[] = currentSectionId
    ? menuSections[currentSectionId] || []
    : [];

  function updateItem(
    index: number,
    field: keyof MenuItem,
    value: string | boolean
  ) {
    if (!currentSectionId) return;

    setMenuSections((prev) => {
      const sectionItems = [...(prev[currentSectionId] || [])];

      const existing = sectionItems[index] ?? {
        id: currentSectionId.toLowerCase() + "-custom-" + uid(),
        label: "",
        price: "",
        active: true
      };

      const updated: MenuItem = {
        ...existing,
        [field]: value as any
      };

      sectionItems[index] = updated;

      return {
        ...prev,
        [currentSectionId]: sectionItems
      };
    });
  }

  function addRow() {
    if (!currentSectionId) return;
    setMenuSections((prev) => {
      const sectionItems = [...(prev[currentSectionId] || [])];
      sectionItems.push({
        id: currentSectionId.toLowerCase() + "-custom-" + uid(),
        label: "",
        price: "",
        active: true
      });
      return {
        ...prev,
        [currentSectionId]: sectionItems
      };
    });
  }

  function removeRow(index: number) {
    if (!currentSectionId) return;
    setMenuSections((prev) => {
      const sectionItems = [...(prev[currentSectionId] || [])];
      sectionItems.splice(index, 1);
      return {
        ...prev,
        [currentSectionId]: sectionItems
      };
    });
  }

  async function handleSave() {
    setStatusText("");
    setStatusKind("");

    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuSections })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save menu.");
      }

      const data = await res.json();
      const updatedSections: MenuSections =
        data.menuSections || menuSections;

      setMenuSections(updatedSections);
      setStatusText("Menu saved. Boards will refresh automatically.");
      setStatusKind("ok");
    } catch (err: any) {
      console.error(err);
      setStatusText(err?.message || "Error saving menu.");
      setStatusKind("err");
    }
  }

  // Auth guard UI

  if (status === "loading") {
    return <div style={{ color: "#e5e7eb", padding: 24 }}>Loading...</div>;
  }

  if (!session) {
    return (
      <div style={{ color: "#e5e7eb", padding: 24, background: "#0b1120", minHeight: "100vh" }}>
        <p>You must sign in to access the menu editor.</p>
        <button onClick={() => signIn("google")}>Sign in with Google</button>
      </div>
    );
  }

  // Admin UI

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#0b1120" }}>
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            fontSize: 12
          }}
        >
          <div>Signed in as {session.user?.email}</div>
          <button className="btn-ghost" onClick={() => signOut()}>
            Sign out
          </button>
        </div>

        <h1>Menu Admin</h1>
        <p>
          Edit menu sections – add, remove, rename items, or change prices.
          Toggle items inactive instead of deleting if you just want to hide them.
        </p>

        <div className="pill-row">
          <span className="pill">
            Editing section:{" "}
            <strong>{currentSectionId ?? "—"}</strong>
          </span>
          <span className="pill small">
            Inactive items are hidden from boards but kept here.
          </span>
        </div>

        <div className="toolbar">
          <div>
            <label htmlFor="sectionSelect">Section</label>
            <br />
            <select
              id="sectionSelect"
              value={currentSectionId ?? ""}
              onChange={(e) => {
                const value = e.target.value || null;
                setCurrentSectionId(value);
                setStatusText("");
                setStatusKind("");
              }}
            >
              {Object.keys(menuSections).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <div className="small">
            HOT_DOGS, BURGERS, SIDES_LEFT, etc.
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: "25%" }}>
                Item ID <span className="small">(internal)</span>
              </th>
              <th>Label</th>
              <th style={{ width: "14%" }}>Price</th>
              <th style={{ width: "10%" }}>Active</th>
              <th style={{ width: 60 }}>Remove</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={item.id || index}>
                <td>
                  <input
                    type="text"
                    value={item.id}
                    onChange={(e) =>
                      updateItem(index, "id", e.target.value.trim())
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.label || ""}
                    onChange={(e) =>
                      updateItem(index, "label", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.price || ""}
                    onChange={(e) =>
                      updateItem(index, "price", e.target.value)
                    }
                  />
                </td>
                <td>
                  <div className="checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={item.active !== false}
                      onChange={(e) =>
                        updateItem(index, "active", e.target.checked)
                      }
                    />
                  </div>
                </td>
                <td>
                  <button
                    className="btn-danger"
                    style={{ padding: "3px 8px" }}
                    onClick={() => removeRow(index)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}

            {currentItems.length === 0 && (
              <tr>
                <td colSpan={5} style={{ fontSize: 12, color: "#6b7280" }}>
                  No items in this section yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="actions">
          <button className="btn-ghost" onClick={addRow}>
            + Add item
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save all changes
          </button>
        </div>

        {statusText && (
          <div className={`status ${statusKind}`}>
            {statusText}
          </div>
        )}
      </div>
    </div>
  );
}
