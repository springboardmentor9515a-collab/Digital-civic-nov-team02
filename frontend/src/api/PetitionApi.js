export const getPetitionById = async (id) => {
  return {
    id,
    title: "Improve Road Safety Near Schools",
    description:
      "This petition requests speed breakers and zebra crossings near schools to reduce accidents.",
    status: "active", // active | under_review | closed
    signatureCount: 50,
    creator: {
      name: "Rahul Patil",
      role: "Citizen",
    },
    signedUsers: [2, 3],
  };
};

export const signPetition = async () => {
  return { success: true };
};
