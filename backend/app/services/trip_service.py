from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from app.models.trip import TripCreate


class TripService:
    """旅行计划业务服务"""

    def __init__(self, db):
        self.db = db
        self.collection = db.trips

    async def create_trip(self, data: TripCreate, creator_id: str = "anonymous") -> dict:
        """创建旅行计划"""
        trip_doc = {
            "title": data.title,
            "creator_id": creator_id,
            "collaborator_ids": [],
            "destination": data.destination,
            "start_date": data.start_date.isoformat() if data.start_date else None,
            "end_date": data.end_date.isoformat() if data.end_date else None,
            "budget": data.budget,
            "num_people": data.num_people,
            "status": "planning",
            "itinerary": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        result = await self.collection.insert_one(trip_doc)
        trip_doc["id"] = str(result.inserted_id)
        trip_doc.pop("_id", None)
        return trip_doc

    async def get_trips(self, user_id: str = "anonymous", page: int = 1, limit: int = 10) -> list:
        """获取旅行计划列表"""
        skip = (page - 1) * limit
        cursor = self.collection.find({"creator_id": user_id}).skip(skip).limit(limit)
        trips = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            trips.append(doc)
        return trips

    async def get_trip(self, trip_id: str) -> Optional[dict]:
        """获取旅行计划详情"""
        doc = await self.collection.find_one({"_id": ObjectId(trip_id)})
        if doc:
            doc["id"] = str(doc.pop("_id"))
        return doc

    async def update_trip(self, trip_id: str, data: dict) -> Optional[dict]:
        """更新旅行计划"""
        data["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(trip_id)},
            {"$set": data},
        )
        return await self.get_trip(trip_id)
