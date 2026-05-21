const API_BASE = '/api/v1'

export async function sendMessage(sessionId: string, message: string, tripId?: string): Promise<{ session_id: string }> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      message,
      trip_id: tripId,
    }),
  })
  if (!response.ok) throw new Error('Failed to send message')
  return response.json()
}

export async function fetchTrips(page = 1, limit = 10) {
  const response = await fetch(`${API_BASE}/trips?page=${page}&limit=${limit}`)
  if (!response.ok) throw new Error('Failed to fetch trips')
  return response.json()
}

export async function createTrip(data: {
  title: string
  destination: string
  budget?: number
  num_people?: number
}) {
  const response = await fetch(`${API_BASE}/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create trip')
  return response.json()
}
