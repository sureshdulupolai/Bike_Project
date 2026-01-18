import { Bike } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="d-flex align-items-center mb-3">
              <Bike className="me-2" size={24} />
              <h5 className="mb-0">2 Wheeler Sales & Maintenance</h5>
            </div>
            <p className="text-muted mb-0">
              Your trusted partner for 2-wheeler sales and maintenance services.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="text-muted mb-0">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
