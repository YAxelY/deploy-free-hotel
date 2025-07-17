import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Sidebar from '../../components/sidebar/sidebar.jsx'
import Navbar2 from '../../components/navbar2/navbar2.jsx';
import './website.css';
import template1 from '../../assets/images/template1.png';
import template2 from '../../assets/images/template2.png';
import template3 from '../../assets/images/template3.png';

const templates = [
  {
    id: 'luxury-hotel',
    name: 'Luxury Hotel',
    description: 'Perfect for upscale hotels and resorts with elegant design and premium features.',
    preview: template1
  },
  {
    id: 'boutique-hotel',
    name: 'Boutique Hotel',
    description: 'Ideal for small, unique hotels with personality and charm.',
    preview: template2
  },
  {
    id: 'business-hotel',
    name: 'Business Hotel',
    description: 'Great for business hotels focused on corporate travelers and events.',
    preview: template3
  }
];

function Website() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => !prev);
  };

  // Handle window resize in parent
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarExpanded(false);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const navigate = useNavigate();

  const handleSelectTemplate = (templateId) => {
    navigate(`/editor/${templateId}`);
  };

  return (
    <div class="website" id="content">
      <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} isMobile={isMobile} />

      <div
        class="container"
        style={{
          marginLeft: !isMobile && isSidebarExpanded ?
            '280px' : !isMobile && !isSidebarExpanded ?
              '100px' : '100px', transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <main>

          <Navbar2 />

          <h3 class="section-subheader">CHOOSE YOUR HOTEL TEMPLATE</h3>
          <h2 class="section-header">Build Your Own Website</h2>
          <p>Select from our professionally designed templates and customize it to match your hotel's unique style and brand.</p>

          <section className="template-grid">
            {templates.map((template) => (
              <div key={template.id} className="template-card">
                <div className="template-preview">
                  <img src={template.preview} alt={template.name} />
                </div>
                <div className="template-info">
                  <h3>{template.name}</h3>
                  <p id="p-template">{template.description}</p>
                  <button 
                    className="btn"
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    Customize This Template
                  </button>
                </div>
              </div>
            ))}
          </section>

          <p id="p-bottom">More templates coming soon! Each template is fully customizable to match your hotel's brand.</p>


        </main>

      </div>

    </div>
  )
}

export default Website;
