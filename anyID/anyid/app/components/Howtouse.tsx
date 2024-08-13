import {
    CameraIcon,
    CloudArrowUpIcon,
    MagnifyingGlassIcon,
    BookOpenIcon,
    BeakerIcon,
    RocketLaunchIcon
  } from '@heroicons/react/24/solid'
  
  const features = [
    {
      name: 'Upload or Capture',
      description: 'Upload an image or take a photo of anything you want to identify.',
      icon: CloudArrowUpIcon,
    },
    {
      name: 'AI Analysis',
      description: 'Our advanced AI analyzes the image to determine what it is.',
      icon: MagnifyingGlassIcon,
    },
    {
      name: 'Detailed Information',
      description: 'Receive comprehensive details about the identified object.',
      icon: BookOpenIcon,
    },
    {
      name: 'Growth Requirements',
      description: 'Learn about the common uses, significance, or importance of the identified item.',
      icon: RocketLaunchIcon,
    },
    {
      name: 'Interesting Facts',
      description: 'Discover fascinating facts and trivia related to the identified object.',
      icon: BeakerIcon,
    },
    {
      name: 'Easy to Use',
      description: 'User-friendly interface suitable for everyone, from curious beginners to experienced users.',
      icon: CameraIcon,
    },
  ]
  
  export default function HowToUse() {
    return (
      <div className="py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-blue sm:text-4xl">
              How to Use anyID
            </h2>
            <p className="mt-4 text-xl text-gray-800">
              Discover the world of plants with these easy steps
            </p>
          </div>
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="bg-gray-800 rounded-lg px-6 py-5 flex items-start">
                  <div className="flex-shrink-0">
                    <feature.icon className="h-8 w-8 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">{feature.name}</h3>
                    <p className="mt-2 text-base text-gray-300">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }