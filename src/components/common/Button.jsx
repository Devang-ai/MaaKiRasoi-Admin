import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  className = '', 
  onClick, 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:from-orange-600 hover:to-orange-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-orange-500',
    secondary: 'bg-transparent text-orange-600 border-2 border-orange-600 hover:bg-orange-600 hover:text-white focus:ring-orange-500',
    outline: 'bg-transparent text-orange-600 border border-orange-300 hover:bg-orange-50 focus:ring-orange-500',
    ghost: 'bg-transparent text-orange-600 hover:bg-orange-50 focus:ring-orange-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed transform-none';

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabled ? disabledClasses : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Button;
