import React, { useMemo, useState } from 'react'

const ROLES = ['Regulator / State Actor', 'Participant (Company / Consortium / Public Body)'] as const
type Role = typeof ROLES[number]

type Answer = {
  needLegalFlex?: 'yes' | 'no' | null
  sensitiveData?: 'none' | 'nonSensitive' | 'personalOrSensitive' | null
  testingLocation?: 'lab' | 'realWorld' | 'policySpace' | null
  desiredOutcome?: 'techBenchmarks' | 'societalFit' | 'policyPrototypes' | 'regulatoryClarity' | 'dataInsights' | null
  regulatorPrimary?: 'techFeasibility' | 'socialUptake' | 'policyDesign' | 'legalFlex' | 'sensitiveAnalytics' | null
  regulatorRealUsers?: 'labOnly' | 'needRealUsersLater' | null
  participantBlocker?: 'techPerf' | 'userAcceptance' | 'policyDesign' | 'regObligations' | 'dataAccess' | null
}

type Instrument = 'Regulatory Sandbox' | 'Testbed' | 'Living Lab' | 'Policy Lab' | 'Trusted Research Environment (TRE)'
type Recommendation = { primary: Instrument, secondary?: Instrument[], notes: string[] }

export default function App () {
  const [role, setRole] = useState<Role | null>(null)
  const [step, setStep] = useState<number>(0)
  const [ans, setAns] = useState<Answer>({})

  const reset = () => { setRole(null); setStep(0); setAns({}) }
  const rec = useMemo(() => computeRecommendation(role, ans), [role, ans])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-3xl mx-auto p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Regulatory Experiment Picker</h1>
          <p className="text-slate-600 mt-1">
            Find out whether you need a <b>Regulatory Sandbox</b>, <b>Testbed</b>, <b>Living Lab</b>, <b>Policy Lab</b>,
            or a <b>Trusted Research Environment (TRE)</b>.
          </p>
        </header>

        {!role && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">First, who are you?</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {ROLES.map(r => (
                <button key={r} onClick={() => { setRole(r); setStep(1); }}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-4 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
                  <div className="text-lg font-medium">{r}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {r === ROLES[0]
                      ? 'Public authority seeking the right instrument for supervised trials or policy design.'
                      : 'Organisation looking to test a solution, access data, or navigate rules.'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {role && (
          <div className="bg-white rounded-2xl shadow p-6 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{role} — step {step}</h2>
              <button onClick={reset} className="text-sm text-slate-600 hover:text-slate-900 underline">Start over</button>
            </div>

            {role === ROLES[0]
              ? <RegulatorSteps step={step} setStep={setStep} ans={ans} setAns={setAns} />
              : <ParticipantSteps step={step} setStep={setStep} ans={ans} setAns={setAns} />
            }

            {rec && step >= (role === ROLES[0] ? 4 : 5) && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">Recommendation</h3>
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <div className="text-base">Primary instrument: <span className="font-semibold">{rec.primary}</span></div>
                  {rec.secondary && rec.secondary.length > 0 && (
                    <div className="text-sm mt-1">
                      Secondary/Sequencing: {rec.secondary.map((s, i) => <span key={s} className="inline-block mr-2">{s}{i < rec.secondary!.length - 1 ? ',' : ''}</span>)}
                    </div>
                  )}
                  <ul className="list-disc ml-5 mt-3 text-sm text-slate-700 space-y-1">
                    {rec.notes.map((n, idx) => <li key={idx}>{n}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="mt-10 text-center text-xs text-slate-500">
          <p>Tip: adjust answers and the recommendation updates instantly.</p>
        </footer>
      </div>
    </div>
  )
}

function RegulatorSteps ({ step, setStep, ans, setAns }: any) {
  return (
    <div className="space-y-6">
      {step >= 1 && (
        <CardQ
          title="1) What is the primary learning objective?"
          subtitle="Choose the closest match."
          options={[
            { key: 'techFeasibility', label: 'Can the technology work reliably/safely? (technical feasibility)', help: 'Leans toward Testbed unless other constraints apply.' },
            { key: 'socialUptake', label: 'Will people accept/use it in the wild? (socio-technical uptake)', help: 'Leans toward Living Lab.' },
            { key: 'policyDesign', label: 'How should policy/rules be designed? (iterate policy options)', help: 'Leans toward Policy Lab.' },
            { key: 'legalFlex', label: 'Test fit with existing law or adjust obligations temporarily (legal flex needed)', help: 'Leans toward Regulatory Sandbox.' },
            { key: 'sensitiveAnalytics', label: 'We need to analyse sensitive datasets to generate evidence', help: 'Leans toward TRE.' },
          ]}
          value={ans.regulatorPrimary ?? null}
          onChange={(v: string) => { setAns({ ...ans, regulatorPrimary: v }); setStep(2); }}
        />
      )}

      {step >= 2 && ans.regulatorPrimary === 'techFeasibility' && (
        <CardQ
          title="2) For feasibility, do you need real users or controlled conditions?"
          options={[
            { key: 'labOnly', label: 'Controlled lab/simulated conditions are fine', help: 'Favors Testbed.' },
            { key: 'needRealUsersLater', label: 'We’ll need some real-user exposure later', help: 'Favors Testbed → Living Lab sequence.' },
          ]}
          value={ans.regulatorRealUsers ?? null}
          onChange={(v: string) => { setAns({ ...ans, regulatorRealUsers: v }); setStep(3); }}
        />
      )}

      {step >= 2 && ans.regulatorPrimary !== 'techFeasibility' && (
        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 text-sm">
          <p className="mb-2"><span className="font-medium">Shortcut:</span> Based on your primary objective, you may already have a likely instrument. Continue to confirm cross-cutting constraints.</p>
          <ul className="list-disc ml-5 text-slate-700">
            {ans.regulatorPrimary === 'socialUptake' && <li>Likely: <b>Living Lab</b>.</li>}
            {ans.regulatorPrimary === 'policyDesign' && <li>Likely: <b>Policy Lab</b>.</li>}
            {ans.regulatorPrimary === 'legalFlex' && <li>Likely: <b>Regulatory Sandbox</b>.</li>}
            {ans.regulatorPrimary === 'sensitiveAnalytics' && <li>Likely: <b>Trusted Research Environment (TRE)</b>.</li>}
          </ul>
          <button className="mt-3 text-slate-700 underline" onClick={() => setStep(3)}>Next</button>
        </div>
      )}

      {step >= 3 && (
        <CardQ
          title="3) Do you need temporary legal derogations (waivers/comfort letters) under supervision?"
          subtitle="If yes, you are in sandbox territory."
          options={[
            { key: 'yes', label: 'Yes — we need specific rules tweaked/relaxed temporarily' },
            { key: 'no', label: 'No — we can operate under existing rules' },
          ]}
          value={ans.needLegalFlex ?? null}
          onChange={(v: string) => { setAns({ ...ans, needLegalFlex: v }); setStep(4); }}
        />
      )}

      {step >= 4 && (
        <CardQ
          title="4) Will personal or sensitive data be processed during trials?"
          options={[
            { key: 'none', label: 'No' },
            { key: 'nonSensitive', label: 'Yes, but non-sensitive / de-identified only' },
            { key: 'personalOrSensitive', label: 'Yes — personal/special-category or commercially sensitive data' },
          ]}
          value={ans.sensitiveData ?? null}
          onChange={(v: string) => { setAns({ ...ans, sensitiveData: v }); }}
        />
      )}
    </div>
  )
}

function ParticipantSteps ({ step, setStep, ans, setAns }: any) {
  return (
    <div className="space-y-6">
      {step >= 1 && (
        <CardQ
          title="1) What’s your main blocker right now?"
          options={[
            { key: 'techPerf', label: 'Technical performance / interoperability' },
            { key: 'userAcceptance', label: 'User acceptance / behavioural fit' },
            { key: 'policyDesign', label: 'Policy/service design uncertainty' },
            { key: 'regObligations', label: 'Regulatory obligations / need temporary relief' },
            { key: 'dataAccess', label: 'Access to sensitive data for analysis' },
          ]}
          value={ans.participantBlocker ?? null}
          onChange={(v: string) => { setAns({ ...ans, participantBlocker: v }); setStep(2); }}
        />
      )}

      {step >= 2 && (
        <CardQ
          title="2) Do you need any rule to be tweaked or switched off temporarily?"
          subtitle="If yes, you likely need a sandbox."
          options={[
            { key: 'yes', label: 'Yes — some requirements block testing' },
            { key: 'no', label: 'No — we can test under current rules' },
          ]}
          value={ans.needLegalFlex ?? null}
          onChange={(v: string) => { setAns({ ...ans, needLegalFlex: v }); setStep(3); }}
        />
      )}

      {step >= 3 && (
        <CardQ
          title="3) Where must testing occur?"
          options={[
            { key: 'lab', label: 'Lab/simulated/controlled environment' },
            { key: 'realWorld', label: 'Real-world setting with users/citizens' },
            { key: 'policySpace', label: 'Policy/service design workshops or trials' },
          ]}
          value={ans.testingLocation ?? null}
          onChange={(v: string) => { setAns({ ...ans, testingLocation: v }); setStep(4); }}
        />
      )}

      {step >= 4 && (
        <CardQ
          title="4) What kind of data will you use?"
          options={[
            { key: 'none', label: 'None' },
            { key: 'nonSensitive', label: 'Public/synthetic or non-sensitive internal data' },
            { key: 'personalOrSensitive', label: 'Personal/special-category or commercially sensitive data' },
          ]}
          value={ans.sensitiveData ?? null}
          onChange={(v: string) => { setAns({ ...ans, sensitiveData: v }); setStep(5); }}
        />
      )}

      {step >= 5 && (
        <CardQ
          title="5) What outcome do you want on exit?"
          options={[
            { key: 'techBenchmarks', label: 'Technical certification / benchmarks' },
            { key: 'societalFit', label: 'Evidence of societal fit / impact' },
            { key: 'policyPrototypes', label: 'Policy recommendations / prototypes' },
            { key: 'regulatoryClarity', label: 'Regulatory comfort/guidance and clearer compliance path' },
            { key: 'dataInsights', label: 'Peer-reviewed insights from safeguarded data' },
          ]}
          value={ans.desiredOutcome ?? null}
          onChange={(v: string) => { setAns({ ...ans, desiredOutcome: v }); }}
        />
      )}
    </div>
  )
}

function CardQ ({ title, subtitle, options, value, onChange }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-2">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
      </div>
      <div className="grid gap-3">
        {options.map((opt: any) => (
          <label key={opt.key} className={`flex items-start gap-3 p-3 rounded-xl border ${value === opt.key ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:bg-slate-50'}`}>
            <input type="radio" name={title} value={opt.key} checked={value === opt.key} onChange={() => onChange(opt.key)} className="mt-1" />
            <div>
              <div className="font-medium">{opt.label}</div>
              {opt.help && <div className="text-xs text-slate-600 mt-1">{opt.help}</div>}
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

function computeRecommendation (role: Role | null, a: Answer): Recommendation | null {
  if (!role) return null

  if (a.needLegalFlex === 'yes') {
    const notes = ['You indicated a need for supervised, time-limited legal derogations — this is the defining feature of a Regulatory Sandbox.']
    if (a.sensitiveData === 'personalOrSensitive') {
      notes.push('Because sensitive data are involved, run data work inside a TRE or with TRE-like controls (e.g., Five Safes).')
    }
    return { primary: 'Regulatory Sandbox', secondary: secondaryFromRole(role, a), notes }
  }

  if ((a.sensitiveData === 'personalOrSensitive' &&
        ((role === ROLES[0] && a.regulatorPrimary === 'sensitiveAnalytics') ||
         (role === ROLES[1] && a.participantBlocker === 'dataAccess')))) {
    return {
      primary: 'Trusted Research Environment (TRE)',
      secondary: recommendSecondary(role, a),
      notes: ['Your main blocker is access to sensitive data: a TRE provides controlled, audited analysis with safe people/projects/settings/data/outputs.']
    }
  }

  if (role === ROLES[0]) {
    switch (a.regulatorPrimary) {
      case 'techFeasibility':
        if (a.regulatorRealUsers === 'labOnly') {
          return { primary: 'Testbed', secondary: ['Living Lab'], notes: ['Technical feasibility in controlled conditions points to a Testbed.', 'Once KPIs are met, consider a Living Lab to validate societal uptake.'] }
        }
        if (a.regulatorRealUsers === 'needRealUsersLater') {
          return { primary: 'Testbed', secondary: ['Living Lab'], notes: ['Start in a Testbed to de-risk performance; plan for a Living Lab phase to observe real-world use.'] }
        }
        break
      case 'socialUptake':
        return { primary: 'Living Lab', secondary: ['Testbed'], notes: ['Your focus is socio-technical acceptance in real settings — that’s a Living Lab’s core purpose.', 'You can precede it with Testbed validation if technical risks remain high.'] }
      case 'policyDesign':
        return { primary: 'Policy Lab', secondary: ['Living Lab'], notes: ['You’re iterating policy/service options — a Policy Lab fits (co-design, prototypes, trials).', 'If needed, validate in a Living Lab with users before formal rulemaking.'] }
      case 'legalFlex':
        return { primary: 'Regulatory Sandbox', secondary: recommendSecondary(role, a), notes: ['Testing under modified rules requires a Regulatory Sandbox with supervision, time limits, and exit criteria.'] }
      case 'sensitiveAnalytics':
        return { primary: 'Trusted Research Environment (TRE)', secondary: recommendSecondary(role, a), notes: ['You need safeguarded access to sensitive data — a TRE is designed for that (Five Safes).'] }
    }
  } else {
    switch (a.participantBlocker) {
      case 'techPerf':
        return { primary: 'Testbed', secondary: ['Living Lab'], notes: ['Resolve performance/interoperability in a Testbed first.', 'Then move to a Living Lab for real-world behaviour and uptake.'] }
      case 'userAcceptance':
        return { primary: 'Living Lab', secondary: ['Testbed'], notes: ['User acceptance and societal fit point to a Living Lab in real settings.', 'If technical risk remains, run a short Testbed phase first.'] }
      case 'policyDesign':
        return { primary: 'Policy Lab', secondary: ['Living Lab'], notes: ['Unclear policy/service design calls for a Policy Lab (co-design, prototyping, evaluation).', 'You can validate outcomes in a Living Lab before scaling.'] }
      case 'regObligations':
        return { primary: 'Regulatory Sandbox', secondary: recommendSecondary(role, a), notes: ['Temporary, supervised legal flex to test in the wild is what a Regulatory Sandbox provides.'] }
      case 'dataAccess':
        return { primary: 'Trusted Research Environment (TRE)', secondary: recommendSecondary(role, a), notes: ['Your blocker is sensitive data access — use a TRE with audited outputs and disclosure control.'] }
    }
  }
  return null
}

function recommendSecondary (role: Role, a: Answer): Instrument[] | undefined {
  const secs: Instrument[] = []
  if (role === ROLES[0]) {
    if (a.regulatorPrimary === 'legalFlex' || a.needLegalFlex === 'yes') secs.push('Testbed', 'Living Lab')
    if (a.sensitiveData === 'personalOrSensitive') secs.push('Trusted Research Environment (TRE)')
  } else {
    if (a.participantBlocker === 'regObligations' || a.needLegalFlex === 'yes') secs.push('Testbed', 'Living Lab')
    if (a.sensitiveData === 'personalOrSensitive') secs.push('Trusted Research Environment (TRE)')
  }
  return secs.length ? secs : undefined
}

function secondaryFromRole (role: Role, a: Answer) { return recommendSecondary(role, a) }
