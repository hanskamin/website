import Image from 'next/image';
import Button from './ui/Button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-[family-name:var(--font-geist-mono)]">
      {/* Main Content Wrapper */}
      <div className="flex flex-col items-center text-center">
        {/* Profile Image */}
        <div className="mb-4 relative flex justify-center">
          <Image
            src="/profile.jpeg"
            alt="Hans Kamin"
            className="rounded-full shadow-lg w-auto h-auto"
            width={250}
            height={250}
          />
        </div>

        {/* Text */}
        <div className='py-4'>
          {/* Name */}
          <h1 className="text-3xl font-semibold pb-2">
            Hans
          </h1>

          {/* Location */}
          <p className="text-lg pb-2">
            New York, NY
          </p>

          {/* Bio */}
          <p className="text-md pb-5">
            Musician, Tennis Player, Developer
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
          <Button
            className="py-4 px-6 rounded-full"
            title={"👨🏾‍🎤 Music"}
            route={"/music"}
          />
          <Button
            className="py-4 px-6 text-white rounded-full"
            title={"👨🏾‍💻 Software"}
            route={"/software"}
          />
          <Button
            className="py-4 px-6 rounded-full"
            title={"🇺🇳 Volunteering"}
            route={"/volunteering"}
          />
        </div>
      </div>
    </div>
  );
}