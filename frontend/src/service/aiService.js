export const getAIVideo = async (payload) => {
  const token = localStorage.getItem("token");

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

  let data;

  try {
    data = await response.json();
  } catch (err) {
    throw new Error("Server returned empty or invalid JSON");
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};