
export default function TermsAndConditions() {
  const terms = [
    {
      title: "Welcome to PixelBank",
      description:
        "Please read these Terms carefully before using our site operated by Deep Machine Learning LLC.",
    },
    {
      title: "1. Use of the Service",
      description:
        "PixelBank provides educational content and challenges for learning machine learning. You must be at least 13 years old to use the Service. Use it only for lawful purposes.",
    },
    {
      title: "2. User Accounts",
      description:
        "You are responsible for maintaining the confidentiality of your account. Ensure the information you provide is accurate and current.",
    },
    {
      title: "3. Intellectual Property",
      description:
        "All content on PixelBank is owned by or licensed to Deep Machine Learning LLC. Users retain ownership of their submissions but grant Deep Machine Learning LLC a license to use it in connection with the Service.",
    },
    {
      title: "4. Educational Use Only",
      description:
        "The Service is intended for personal, educational, and non-commercial use only. Commercial use without permission is prohibited.",
    },
    {
      title: "5. User Conduct",
      description:
        "You agree not to violate laws, infringe rights, upload harmful content, or interfere with the platform.",
    },
    {
      title: "6. Disclaimer of Warranties",
      description:
        "The Service is provided 'as is' without warranties of any kind. We do not guarantee specific educational outcomes.",
    },
    {
      title: "7. Limitation of Liability",
      description:
        "Deep Machine Learning LLC is not liable for indirect or consequential damages. Total liability will not exceed $100.",
    },
    {
      title: "8. Termination",
      description:
        "We reserve the right to suspend or terminate your account at our sole discretion.",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-[var(--color-bg-black)] text-[var(--color-bg)] dark:text-[var(--color-fg)] p-6">
        <div className="max-w-10xl mx-auto">
          {/* Page Header */}
          <h1 className="text-3xl font-bold text-center mb-2">
            Terms and Conditions
          </h1>
          <p className="text-center text-sm mb-8">
            Effective Date: 07/09/2025
          </p>

          {/* Overview Bar */}
          <div className="rounded-lg border dark:border-[var(--color-muted)] border-zinc-300 bg-white dark:bg-zinc-900 text-center p-2 mb-6">
            <span className="font-medium">Overview</span>
          </div>

          {/* Terms Content */}
          <div className="space-y-6">
            {terms.map((section, idx) => (
              <div
                key={idx}
                className="rounded-2xl border dark:border-[var(--color-muted)] border-zinc-300 dark:bg-zinc-900 bg-white p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold mb-2">
                  {section.title}
                </h2>
                <p className="text-sm leading-relaxed">
                  {section.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
