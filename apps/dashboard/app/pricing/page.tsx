import Link from 'next/link';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for side projects and hobby applications.',
    features: [
      'Monitor up to 3 endpoints',
      '5-minute ping intervals',
      'Basic email alerts',
      '7-day metrics history',
      'Public status page'
    ],
    cta: 'Start for Free',
    ctaLink: '/signup',
    highlight: false
  },
  {
    name: 'Pro',
    price: '$9/month',
    description: 'For professionals who need reliable services.',
    features: [
      'Monitor up to 20 endpoints',
      '1-minute ping intervals',
      'Email & webhook alerts',
      '30-day metrics history',
      'Custom status page',
      'API access',
      'Slack integrations'
    ],
    cta: 'Upgrade to Pro',
    ctaLink: '/signup?plan=pro',
    highlight: true
  },
  {
    name: 'Enterprise',
    price: 'Contact Us',
    description: 'Custom solutions for larger organizations.',
    features: [
      'Unlimited endpoints',
      'Custom ping intervals',
      'Priority support',
      'Unlimited metrics history',
      'White-label status page',
      'Advanced API access',
      'Custom integrations',
      'SLA guarantees'
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
    highlight: false
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Pricing</h1>
          <nav className="flex space-x-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
            <Link href="/docs" className="text-gray-500 hover:text-gray-700">
              Documentation
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-xl text-gray-500">
            Choose the plan that works best for your project needs
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {tiers.map((tier) => (
            <div key={tier.name} className={`rounded-lg shadow-lg divide-y divide-gray-200 ${tier.highlight ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">{tier.name}</h2>
                <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                  {tier.name !== 'Enterprise' && <span className="text-base font-medium text-gray-500">/month</span>}
                </p>
                <Link 
                  href={tier.ctaLink}
                  className={`mt-8 block w-full bg-${tier.highlight ? 'blue' : 'gray'}-600 hover:bg-${tier.highlight ? 'blue' : 'gray'}-700 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center`}
                >
                  {tier.cta}
                </Link>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-6 divide-y divide-gray-200">
            <div className="pt-6">
              <dt className="text-lg">
                <span className="font-medium text-gray-900">
                  Can I use Ping-Me for free?
                </span>
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                Yes! Our Free tier includes monitoring for up to 3 endpoints, which is perfect for small projects or trying out the service.
              </dd>
            </div>

            <div className="pt-6">
              <dt className="text-lg">
                <span className="font-medium text-gray-900">
                  How does billing work?
                </span>
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                We bill monthly, and you can upgrade or downgrade your plan at any time. When you upgrade, we'll prorate your billing to account for the time remaining in your billing cycle.
              </dd>
            </div>

            <div className="pt-6">
              <dt className="text-lg">
                <span className="font-medium text-gray-900">
                  What happens if I exceed my plan limits?
                </span>
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                We'll notify you when you're approaching your plan limits. If you exceed them, we'll continue monitoring your existing endpoints, but you won't be able to add new ones until you upgrade or remove some endpoints.
              </dd>
            </div>

            <div className="pt-6">
              <dt className="text-lg">
                <span className="font-medium text-gray-900">
                  Do you offer refunds?
                </span>
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                Yes, we offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team within 14 days of your purchase for a full refund.
              </dd>
            </div>
          </div>
        </div>

        {/* Sponsor section */}
        <div className="bg-blue-700 rounded-lg shadow-xl mt-20 px-6 py-8 sm:p-10">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-white">
              Support Ping-Me Development
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-blue-200">
              Ping-Me is an open-source project maintained by passionate developers. Your sponsorship helps us improve the service and keep it accessible to everyone.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <a
                href="https://github.com/sponsors/mreshank"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub Sponsors
              </a>
              <a
                href="https://www.buymeacoffee.com/mreshank"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 01-.169.364zm-6.159 3.9c-.862.37-1.84.788-3.109.788a5.884 5.884 0 01-1.569-.217l.877 9.004c.065.78.717 1.38 1.5 1.38 0 0 1.243.065 1.658.065.447 0 1.786-.065 1.786-.065.783 0 1.434-.6 1.499-1.38l.94-9.95a3.996 3.996 0 00-1.322-.238c-.826 0-1.491.284-2.26.613z"/>
                </svg>
                Buy Me a Coffee
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 