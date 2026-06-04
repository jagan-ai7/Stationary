export default function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground md:flex-row">
        <div>© {new Date().getFullYear()} Inkwell Stationery. All rights reserved.</div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}