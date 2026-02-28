export const getAIVideo = async (payload) => {
  const token = localStorage.getItem("token");
  console.log(payload);

  const response = await fetch(
    "/api/ai/generate-video",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch AI video");
  }

  return data;
};
