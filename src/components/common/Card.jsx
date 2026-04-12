import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'medium',
  shadow = 'soft',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-2xl border border-gray-200 transition-all duration-200';
  
  const paddingClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const shadowClasses = {
    none: '',
    soft: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg',
    premium: 'shadow-xl',
  };

  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';

  const classes = `
    ${baseClasses}
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${hoverClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      className={classes}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'small', 'medium', 'large']),
  shadow: PropTypes.oneOf(['none', 'soft', 'medium', 'large', 'premium']),
};

export default Card;
