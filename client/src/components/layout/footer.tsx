import { SiInstagram, SiFacebook, SiPinterest, SiX } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-primary/5 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-4">
          <h2 className="font-serif text-2xl">Casa Comfort</h2>
          <p className="text-muted-foreground text-center">
            Making your house feel like home, one comfort at a time
          </p>

          <div className="flex space-x-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <SiInstagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <SiFacebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <SiPinterest className="h-6 w-6" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <SiX className="h-6 w-6" />
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Casa Comfort. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}