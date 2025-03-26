import { useState } from 'react';
import { useAuthContext } from './auth/AuthProvider';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { AuthForm } from './auth/AuthForm';

export function Navbar() {
  const { user, signOut } = useAuthContext();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex-1">
          {/* Your logo or brand name */}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button
                variant="outline"
                onClick={() => signOut()}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              onClick={() => setShowAuthDialog(true)}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-[425px] p-0">
          <AuthForm onSuccess={() => setShowAuthDialog(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
}
