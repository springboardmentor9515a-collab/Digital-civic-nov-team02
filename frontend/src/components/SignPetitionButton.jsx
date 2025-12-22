import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { signPetition } from "../api/petitionApi";

const SignPetitionButton = ({ petition, onSigned }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Visible only to citizens
  if (user.role !== "citizen") return null;

  const alreadySigned = petition.signedUsers.includes(user.id);
  const disabled = alreadySigned || petition.status !== "active";

  const handleSign = async () => {
    setLoading(true);

    // Optimistic UI update
    onSigned();

    await signPetition(petition.id);
    setLoading(false);
  };

  return (
    <button
      onClick={handleSign}
      disabled={disabled || loading}
      style={{
        marginTop: "16px",
        padding: "10px 20px",
        backgroundColor: disabled ? "#ccc" : "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {alreadySigned ? "Already Signed" : "Sign Petition"}
    </button>
  );
};

export default SignPetitionButton;
