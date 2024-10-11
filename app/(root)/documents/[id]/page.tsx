import CollaborativeRoom from "@/components/CollaborativeRoom";
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Document = async ({params:{id}}:SearchParamProps) => {
  const clerkUser = await currentUser();

  if(!clerkUser) redirect('/sign-in');
  
  const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
  if (!userEmail) {
    console.error("User email not found");
    redirect('/');
  }

  const room = await getDocument({
    roomId: id,
    userId: userEmail
  });

  if(!room) redirect('/');

  const userAccesses = room.userAccesses || {};
  const userIds = Object.keys(userAccesses);
  const users = await getClerkUsers({userIds});

  const userData = users.map((user:User) => ({
    ...user,
    userType: room.usersAccesses[user.email]?.includes('room:write')
      ? 'editor'
      : 'viewer'
  }));

  const currentUserType = room.usersAccesses[userEmail]?.includes('room:write')
    ? 'editor'
    : 'viewer';

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom
        roomId={id}
        roomMetadata={room.metadata} 
        users={userData} 
        currentUserType={currentUserType} 
      />
    </main>
  )
}

export default Document;