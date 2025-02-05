import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./ProfileForm";
import { AvatarUpload } from "./AvatarUpload";

const ProfileSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your profile information and avatar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AvatarUpload />
        <ProfileForm />
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;