import Image from 'next/image';

import HeroImage from '@/public/office.jpg';

export function AuthHeroPanel() {
  return (
    <div className="w-6/12 h-screen relative overflow-hidden">
      <Image src={HeroImage} alt="Hero" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 z-10 flex items-end p-16">
        <div className="max-w-lg text-white">
          <p className="text-3xl font-semibold leading-tight">
            “This platform completely transformed the way our team works.
            Everything is faster, cleaner, and far easier to manage.”
          </p>
          <div className="mt-8">
            <p className="font-semibold">Sarah Johnson</p>
            <p className="text-white/80">Product Manager at Acme Inc.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
