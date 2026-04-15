import { TRUST_FEATURES } from './home.constants'

export function HomeTrustSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-3">
        {TRUST_FEATURES.map((feature) => (
          <article key={feature.title} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-900/5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-600/10">
                <feature.icon className="h-6 w-6 text-sky-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}