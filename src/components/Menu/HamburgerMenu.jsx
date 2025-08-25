// src/components/Menu/HamburgerMenu.jsx
import React from "react";
import Modal from "../Modal";
import LogoLink from "../Buttons/LogoLink";

const navItems = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Website Solutions", href: "/#website-types" },
  { label: "Web Hosting", href: "/#hosting" },
  { label: "Add-On Services", href: "/#add-ons" },
  { label: "Projects", href: "/#projects" },
  { label: "Contact", href: "/#contact" },
];

export default function HamburgerMenu({ checkboxId = "nav-toggle" }) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Sync modal state with checkbox
  React.useEffect(() => {
    const checkbox = document.getElementById(checkboxId);
    if (!checkbox) return;

    const handleChange = () => {
      setIsOpen(checkbox.checked);
    };

    checkbox.addEventListener("change", handleChange);
    // Initialize
    handleChange();

    return () => checkbox.removeEventListener("change", handleChange);
  }, [checkboxId]);

  const handleClose = () => {
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    }
    setIsOpen(false);
  };

  const handleNavClick = () => {
    // Close the menu when nav item is clicked
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeButton={false}
      overlayClass="bg-bg"
      className="w-full h-full bg-bg flex items-center justify-center"
      allowScroll={false}
    >
      <div className="relative w-full h-full flex flex-col">
        {/* Navigation Menu */}
        <nav className="flex-1 flex items-center justify-center">
          <ul className="flex flex-col items-center space-y-6 text-center">
            {navItems.map((item) => (
              <li key={item.label}>
                <LogoLink
                  href={item.href}
                  className="text-3xl md:text-4xl font-bold hover:text-accent transition-colors duration-300"
                  rollIcon={true}
                  onClick={handleNavClick}
                >
                  {item.label}
                </LogoLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Optional footer content in modal */}
        {/* <div className="text-center pb-8 text-muted">
          <p className="text-sm">Ready to transform your online presence?</p>
        </div> */}
      </div>
    </Modal>
  );
}
