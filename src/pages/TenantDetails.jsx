import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { getTenant } from "../api/tenantApi";

import ErrorMessage from "../components/ErrorMessage";
import Header from "../components/Header";
import Footer from "../components/Footer";

const detailFields = [
  ["Mobile", "mobile"],
  ["Email", "email"],
  ["Address", "address"],
  ["Room No.", "roomNumber"],
  ["Added On", "createdAt"],
];

export default function TenantDetails() {
  const { tenantId } = useParams();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [imageUrl, setImageUrl] = useState(null);
  const loadImage = async () => {

        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://localhost:2027${tenant.profileImageUrl}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            console.error("Failed to load image");
            return;
        }
        console.log("Image loaded successfully");
        console.log(response);


        const blob = await response.blob();

        const url = URL.createObjectURL(blob);

        setImageUrl(url);
    };

  useEffect(() => {
    let ignore = false;

    async function loadTenant() {
      setLoading(true);
      setError(null);

      try {
        const response = await getTenant(tenantId);

        if (!ignore) {
          setTenant(response?.data || response);
          loadImage();
        }
      } catch (fetchError) {
        if (!ignore) {
          setError(fetchError);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadTenant();

    return () => {
      ignore = true;
    };
  }, [tenantId]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Link
              to="/tenants"
              className="text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              &larr; Back to Tenants
            </Link>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Tenant Details
            </h2>
          </div>

          {tenant && (
            <Link
              to={`/tenants/${tenantId}/edit`}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Update Tenant
            </Link>
          )}
        </div>

        <ErrorMessage error={error} />

        {loading ? (
          <p className="text-sm text-slate-500">Loading tenant...</p>
        ) : (
          tenant && (
            <section className="max-w-2xl rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center gap-4">
                {tenant.profileImageUrl ? (
                  <img
                    // src={
                    //   tenant.profileImageUrl
                    //     ? `http://localhost:2027${tenant.profileImageUrl}`
                    //     : "/default-profile.png"
                    // }
                    src={imageUrl}
                    alt={`${tenant.name}'s profile`}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-500"
                  >
                    {tenant.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900">
                  {tenant.name}
                </h3>
              </div>
              <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                {detailFields.map(([label, field]) => (
                  <div key={field} className="min-w-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {label}
                    </dt>
                    <dd className="mt-1 break-words text-sm text-slate-800">
                      {field === "createdAt" && tenant[field]
                        ? new Date(tenant[field]).toLocaleDateString()
                        : tenant[field] || "-"}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}
