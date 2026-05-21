from fastapi import APIRouter, Depends, HTTPException
from app.models.trip import TripCreate
from app.services.trip_service import TripService
from app.api.deps import get_database

router = APIRouter(prefix="/api/v1/trips", tags=["trips"])


@router.post("", response_model=dict)
async def create_trip(data: TripCreate, db=Depends(get_database)):
    """创建旅行计划"""
    service = TripService(db)
    trip = await service.create_trip(data)
    return trip


@router.get("")
async def list_trips(page: int = 1, limit: int = 10, db=Depends(get_database)):
    """获取旅行计划列表"""
    service = TripService(db)
    trips = await service.get_trips(page=page, limit=limit)
    return {"trips": trips, "page": page, "limit": limit}


@router.get("/{trip_id}")
async def get_trip(trip_id: str, db=Depends(get_database)):
    """获取旅行计划详情"""
    service = TripService(db)
    trip = await service.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.put("/{trip_id}")
async def update_trip(trip_id: str, data: dict, db=Depends(get_database)):
    """更新旅行计划"""
    service = TripService(db)
    trip = await service.update_trip(trip_id, data)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip
