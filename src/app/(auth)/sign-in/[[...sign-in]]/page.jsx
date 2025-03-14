import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <section className="bg-white">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        {/* Left Section - Image */}
        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
          <Image
            alt="Sign In"
            src="/sign-in.jpeg"
            width={600}
            height={1000}
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="hidden lg:relative lg:block lg:p-12">
            <h2 className="mt-6 text-2xl font-bold text-black sm:text-3xl md:text-4xl">
              SKILLX
            </h2>
            <p className="mt-4 leading-relaxed text-black">
              A skill exchange platform which lets you connect, learn, and teach in a peer-to-peer-based learning system.
            </p>
          </div>
        </section>

        {/* Right Section - Sign In */}
        <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="max-w-xl lg:max-w-3xl">
            {/* <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
              SKILLX
            </h1>
            <p className="mt-4 leading-relaxed text-gray-500">
              A skill exchange platform which lets you connect, learn, and teach in a peer-to-peer-based learning system.
            </p> */}

            <SignIn />
          </div>
        </main>
      </div>
    </section>
  );
}
