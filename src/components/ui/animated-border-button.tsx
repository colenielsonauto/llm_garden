import React from 'react';
import styled from 'styled-components';
import Link from 'next/link'; // Import Link for navigation

const Button = () => {
  return (
    <StyledWrapper>
      {/* Use Next.js Link for client-side navigation */}
      <Link href="/chat" passHref legacyBehavior>
        <StyledLink>
          <span>Free Access</span> {/* Update text */}
        </StyledLink>
      </Link>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* Removed button styling as it's not directly used for the link appearance */
`;

// Define the styled link component separately
const StyledLink = styled.a`
  position: relative;
  display: inline-block;
  padding: 15px 30px;
  border: 2px solid #fefefe; /* White border */
  text-transform: uppercase;
  color: #fefefe; /* White text */
  text-decoration: none;
  font-family: 'Satoshi', sans-serif; /* Apply Satoshi font */
  font-weight: 700; /* Use a bold weight if available */
  font-size: 18px; /* Slightly smaller font size */
  letter-spacing: 0.1em; /* Add letter spacing */
  background-color: transparent; /* Ensure anchor background is transparent initially */

  &::before {
    content: '';
    position: absolute;
    top: 6px;
    left: -2px;
    width: calc(100% + 4px);
    height: calc(100% - 12px);
    // background-color: #212121; /* Use background color from landing page */
    background-color: #000; /* Change to black for dark mode base */
    transition: 0.3s ease-in-out;
    transform: scaleY(1);
    z-index: 1; /* Ensure pseudo-elements are behind text */

    /* TODO: Add light mode support if needed */
    /* @media (prefers-color-scheme: light) { */
    /*   background-color: #fff; */
    /* } */
  }

  &:hover::before {
    transform: scaleY(0);
  }

  &::after {
    content: '';
    position: absolute;
    left: 6px;
    top: -2px;
    height: calc(100% + 4px);
    width: calc(100% - 12px);
    // background-color: #212121; /* Use background color from landing page */
    background-color: #000; /* Change to black for dark mode base */
    transition: 0.3s ease-in-out;
    transform: scaleX(1);
    transition-delay: 0.5s; /* Keep delay for effect */
    z-index: 1; /* Ensure pseudo-elements are behind text */

    /* TODO: Add light mode support if needed */
    /* @media (prefers-color-scheme: light) { */
    /*   background-color: #fff; */
    /* } */
  }

  &:hover::after {
    transform: scaleX(0);
  }

  span {
    position: relative;
    z-index: 3; /* Keep text above pseudo-elements */
  }
`;

export default Button; 