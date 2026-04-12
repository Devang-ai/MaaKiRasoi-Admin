import React from 'react';
import '../styles/restaurant.css';

const RestaurantDetailModal = ({ restaurant, onClose, onApprove, onReject }) => {
  if (!restaurant) return null;

  const {
    name, ownerName, ownerMobile, contactNumber,
    email, city, state, pincode, address, landmark,
    documents, bankDetails, status, restaurantId
  } = restaurant;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card detail-modal slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Restaurant Details</h3>
            <span className="id-subtitle">{restaurantId || 'Pending ID'}</span>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body scrollable">
          {/* Basic & Contact Info */}
          <section className="detail-section">
            <h4>Basic & Contact Info</h4>
            <div className="detail-grid">
              <div className="info-group">
                <label>Restaurant Name</label>
                <p>{name}</p>
              </div>
              <div className="info-group">
                <label>Owner Name</label>
                <p>{ownerName}</p>
              </div>
              <div className="info-group">
                <label>Owner Mobile</label>
                <p>{ownerMobile || restaurant.phone || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Contact Number</label>
                <p>{contactNumber || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Email Address</label>
                <p>{email}</p>
              </div>
            </div>
          </section>

          {/* Location Info */}
          <section className="detail-section">
            <h4>Location Details</h4>
            <div className="detail-grid">
              <div className="info-group full-width">
                <label>Full Address</label>
                <p>{address}</p>
              </div>
              <div className="info-group">
                <label>City</label>
                <p>{city}</p>
              </div>
              <div className="info-group">
                <label>State</label>
                <p>{state || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Pincode</label>
                <p>{pincode || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Landmark</label>
                <p>{landmark || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Documents */}
          <section className="detail-section">
            <h4>Legal Documents</h4>
            <div className="document-grid">
              {documents?.restaurantLicenseURL && (
                <div className="doc-item">
                  <label>Restaurant License</label>
                  <a href={documents.restaurantLicenseURL} target="_blank" rel="noopener noreferrer" className="doc-preview">
                    <img src={documents.restaurantLicenseURL} alt="License" />
                    <span>View Full Size</span>
                  </a>
                </div>
              )}
              {documents?.fssaiCertificateURL && (
                <div className="doc-item">
                  <label>FSSAI Certificate</label>
                  <a href={documents.fssaiCertificateURL} target="_blank" rel="noopener noreferrer" className="doc-preview">
                    <img src={documents.fssaiCertificateURL} alt="FSSAI" />
                    <span>View Full Size</span>
                  </a>
                </div>
              )}
              {documents?.gstCertificateURL && (
                <div className="doc-item">
                  <label>GST Certificate</label>
                  <a href={documents.gstCertificateURL} target="_blank" rel="noopener noreferrer" className="doc-preview">
                    <img src={documents.gstCertificateURL} alt="GST" />
                    <span>View Full Size</span>
                  </a>
                </div>
              )}
              {(!documents || (!documents.restaurantLicenseURL && !documents.fssaiCertificateURL)) && (
                <p className="no-docs">No documents uploaded</p>
              )}
            </div>
          </section>

          {/* Bank Details */}
          <section className="detail-section">
            <h4>Bank & PAN Details</h4>
            <div className="detail-grid">
              <div className="info-group">
                <label>PAN Number</label>
                <p>{bankDetails?.panNumber || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Account Holder</label>
                <p>{bankDetails?.accountHolderName || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Account Number</label>
                <p>{bankDetails?.accountNumber || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>IFSC Code</label>
                <p>{bankDetails?.ifscCode || 'N/A'}</p>
              </div>
              {bankDetails?.cancelledChequeURL && (
                <div className="doc-item full-width mt-2">
                  <label>Cancelled Cheque / Passbook</label>
                  <a href={bankDetails.cancelledChequeURL} target="_blank" rel="noopener noreferrer" className="doc-preview horizontal">
                    <img src={bankDetails.cancelledChequeURL} alt="Cheque" />
                    <span>View Full Size</span>
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="modal-footer detail-footer">
          <button className="secondary-button" onClick={onClose}>Close</button>
          {status === 'pending' && (
            <div className="action-btns">
              <button className="btn-reject" onClick={() => onReject(restaurant._id)}>Reject Application</button>
              <button className="btn-approve" onClick={() => onApprove(restaurant._id)}>Approve Restaurant</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailModal;
