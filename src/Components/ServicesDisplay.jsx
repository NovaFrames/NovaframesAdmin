// ServicesDisplay.jsx
import { useState } from 'react';

const ServicesDisplay = ({ services }) => {
  const [expandedService, setExpandedService] = useState(null);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);

  const toggleService = (id) => {
    setExpandedService(expandedService === id ? null : id);
  };

  const toggleFaq = (index) => {
    setExpandedFaqIndex(expandedFaqIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Our Services</h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div 
              className="p-6 cursor-pointer flex justify-between items-center"
              onClick={() => toggleService(service.id)}
            >
              <h2 className="text-2xl font-semibold text-gray-800">{service.name}</h2>
              <svg
                className={`w-6 h-6 text-gray-500 transform transition-transform ${expandedService === service.id ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {expandedService === service.id && (
              <div className="px-6 pb-6 space-y-6">
                <p className="text-gray-600">{service.description}</p>
                
                {/* Benefits Section */}
                <div>
                  <h3 className="text-xl font-medium mb-4 text-gray-800">Key Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.benefits.map((benefit, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800">{benefit.name}</h4>
                        <p className="text-gray-700 mt-1">{benefit.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Portfolio Section */}
                <div>
                  <h3 className="text-xl font-medium mb-4 text-gray-800">Our Work</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {service.portfolio.map((item, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        {item.imageUrl && (
                          <img 
                            src={item.imageUrl} 
                            alt={item.projectName} 
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-medium text-lg">{item.projectName}</h4>
                          <p className="text-gray-600 mt-1">{item.description}</p>
                          <div className="mt-3">
                            <h5 className="text-sm font-medium text-gray-700">Techniques Used:</h5>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {item.techniques.map((tech, techIndex) => (
                                <span key={techIndex} className="bg-gray-100 px-2 py-1 text-xs rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* FAQs Section */}
                <div>
                  <h3 className="text-xl font-medium mb-4 text-gray-800">FAQs</h3>
                  <div className="space-y-3">
                    {service.faqs.map((faq, index) => (
                      <div 
                        key={index} 
                        className="border rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => toggleFaq(index)}
                      >
                        <div className="p-4 flex justify-between items-center bg-gray-50">
                          <h4 className="font-medium">{faq.question}</h4>
                          <svg
                            className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedFaqIndex === index ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {expandedFaqIndex === index && (
                          <div className="p-4 border-t">
                            <p className="text-gray-700">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesDisplay;