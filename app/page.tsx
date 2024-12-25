import Image from 'next/image';
import Button from './ui/Button';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen font-[family-name:var(--font-geist-sans)]">
      <div className="text-center">
        {/* Profile Image */}
        <div className="pb-2 mx-auto mb-4 relative">
          <Image
            src="/profile.jpeg"
            alt="Hans Kamin"
            className="rounded-full shadow-lg"
            width={250} // Fixed width
            height={250} // Fixed height
            // objectFit="cover" // Ensure proper cropping
          />
        </div>

        {/* Name */}
        <h1 className="text-3xl font-semibold pb-2 font-[family-name:var(--font-geist-mono)]">Hans Kamin</h1>

        {/* Location */}
        <p className="text-lg pb-5 font-[family-name:var(--font-geist-mono)]">New York, NY</p>

        <Button title='Music' />
      </div>
    </div>
  );
}