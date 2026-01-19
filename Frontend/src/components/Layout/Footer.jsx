import { Bike, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  // Custom styles if not using Tailwind/Bootstrap classes
  const linkStyle = {
    textDecoration: 'none',
    color: '#adb5bd',
    transition: 'color 0.3s',
  };

  const linkHoverStyle = {
    color: '#ffc107', // Yellow accent
  };

  const socialStyle = {
    color: '#f8f9fa',
    transition: 'color 0.3s',
  };

  const socialHoverStyle = {
    color: '#ffc107',
  };

  return (
    <footer style={{ backgroundColor: '#212529', color: '#f8f9fa', paddingTop: '3rem', paddingBottom: '2rem' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="row" style={{ display: 'flex', flexWrap: 'wrap' }}>

          {/* Brand & About */}
          <div className="col-md-4" style={{ flex: '1', minWidth: '250px', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <Bike size={30} style={{ color: '#ffc107', marginRight: '0.5rem' }} />
              <h4 style={{ margin: 0, fontWeight: '700' }}>BikeHub</h4>
            </div>
            <p style={{ color: '#adb5bd', lineHeight: '1.6' }}>
              BikeHub is your trusted partner for 2-wheeler sales, maintenance, and services. 
              We provide high-quality products, expert service, and customer-first solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4" style={{ flex: '1', minWidth: '200px', marginBottom: '2rem' }}>
            <h5 style={{ fontWeight: '700', marginBottom: '1rem' }}>Quick Links</h5>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                { name: 'Home', href: '/' },
                { name: 'Vehicles', href: '/vehicles' },
                { name: 'Dashboard', href: '/customer/dashboard' },
                { name: 'Profile', href: '/profile' },
                { name: 'Services', href: '/customer/services' },
              ].map((link) => (
                <li key={link.name} style={{ marginBottom: '0.5rem' }}>
                  <a
                    href={link.href}
                    style={linkStyle}
                    onMouseEnter={(e) => e.currentTarget.style.color = linkHoverStyle.color}
                    onMouseLeave={(e) => e.currentTarget.style.color = linkStyle.color}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="col-md-4" style={{ flex: '1', minWidth: '250px', marginBottom: '2rem' }}>
            <h5 style={{ fontWeight: '700', marginBottom: '1rem' }}>Contact Us</h5>
            <p style={{ color: '#adb5bd', marginBottom: '0.5rem' }}>
              <strong>Email:</strong> support@bikehub.com
            </p>
            <p style={{ color: '#adb5bd', marginBottom: '1rem' }}>
              <strong>Phone:</strong> +91 9876543210
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, idx) => (
                <Icon
                  key={idx}
                  size={22}
                  style={socialStyle}
                  onMouseEnter={(e) => e.currentTarget.style.color = socialHoverStyle.color}
                  onMouseLeave={(e) => e.currentTarget.style.color = socialStyle.color}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <hr style={{ borderColor: '#495057', margin: '2rem 0' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#adb5bd', marginBottom: '0.5rem' }}>
            &copy; {new Date().getFullYear()} BikeHub. All rights reserved.
          </p>
          <p style={{ color: '#adb5bd', marginBottom: '0.5rem' }}>
            Designed with <span style={{ color: '#ffc107' }}>passion</span> by BikeHub Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
