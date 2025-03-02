import { LoginButton } from "@/components/login-button"
import { CircleIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0E0E10]">
      <header className="border-b border-[#2D2D2F]">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center space-x-2">
            <CircleIcon className="h-6 w-6 text-[#00FF00]" />
            <span className="font-semibold text-white">Big Dog Clip Queue</span>
          </div>
          <nav>
            <LoginButton />
          </nav>
        </div>
      </header>

      <main className="container py-10">
        <div className="max-w-3xl mx-auto space-y-10">
          <section className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-[#00FF00]">Big Dog Clip Queue</h1>
            <p className="text-xl text-gray-400">
              Enqueue and play clips from your Kick Chat using nothing more than your web browser
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#00FF00]">Quickstart</h2>
            <p className="text-gray-400">
              Simply <span className="font-semibold text-white">Login with Kick</span>. You&apos;ll be redirected to
              Kick and asked to allow the application to get your username and read chat in your name. Any information
              received from Kick is not sent anywhere but Kick. The only thing left to do is{" "}
              <span className="font-semibold text-white">wait for some clip links to be posted in chat</span>.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#00FF00]">Features</h2>
            <div className="grid gap-4">
              <FeatureItem
                title="Supports multiple video platforms"
                description="Supports Kick clips, YouTube and Streamable video links"
              />
              <FeatureItem
                title="Integrates with Kick chat"
                description="gathers links from messages to build the queue"
              />
              <FeatureItem
                title="Deduplicates clips"
                description="prevents from adding the same clip to the queue multiple times, persists remembered clips between queues"
              />
              <FeatureItem
                title="Recognizes clip popularity"
                description="when the same clip is posted by multiple users it will be moved up in the queue"
              />
              <FeatureItem
                title="Offers basic queue management"
                description="allows playing clips out of order, removing clips from queue, clearing the queue and purging persistant clip memory"
              />
              <FeatureItem
                title="Handles deleted messages"
                description="when a message with clip link is deleted from chat it is removed from the queue as well"
              />
              <FeatureItem
                title="Respects privacy"
                description="does not store any personal data, does not communicate with any third party services"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1">
        <CircleIcon className="h-5 w-5 text-[#00FF00]" />
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  )
}

