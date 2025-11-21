// app/admin/layout.tsx
import { Providers } from "../providers";

export default function AdminLayout({ children }) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}
