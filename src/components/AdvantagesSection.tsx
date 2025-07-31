import React from 'react';
import { Content } from '../types';

interface AdvantagesSectionProps {
  content: Content['advantages'];
  isDarkMode: boolean;
}


export const AdvantagesSection: React.FC<AdvantagesSectionProps> = ({
  content,
  isDarkMode
  
}) => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.title}</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.items.map((advantage, index) => (
            <div key={index} className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <advantage.icon className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-semibold mb-3">{advantage.title}</h3>
              <p className="opacity-80">{advantage.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};