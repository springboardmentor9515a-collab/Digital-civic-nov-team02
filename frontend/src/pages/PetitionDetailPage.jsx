import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function PetitionDetailPage() {
  const { user } = useAuth();

  const [petition, setPetition] = useState({
    title: "Fix Road Near College",
    description: "Road condition is very bad and causes accidents.",
    status: "active",
    signatures: 12,
    creator: {
      name: "Rahul",
      role: "citizen",
    },
  });

  const [signedByUser, setSignedByUser] = useState(false);

  const handleSign = () => {
    setPetition(p => ({ ...p, signatures: p.signatures + 1 }));
    setSignedByUser(true);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>{petition.title}</h1>
      <p>{petition.description}</p>
      <p><b>Status:</b> {petition.status}</p>
      <p><b>Signatures:</b> {petition.signatures}</p>
      <p>
        <b>Created by:</b> {petition.creator.name} ({petition.creator.role})
      </p>

      {user.role === "citizen" && (
        <button
          onClick={handleSign}
          disabled={signedByUser}
          style={{ marginTop: 20 }}
        >
          {signedByUser ? "Already Signed" : "Sign Petition"}
        </button>
      )}
    </div>
  );
}
