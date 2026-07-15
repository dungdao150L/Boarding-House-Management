from fastapi import FastAPI
from fastapi.responses import Response
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
from pydantic import BaseModel, Field


app = FastAPI(title="Billing Service", version="1.0.0")

REQUEST_COUNT = Counter(
    "billing_http_requests_total",
    "Total HTTP requests handled by billing service",
    ["endpoint"],
)
CALCULATION_DURATION = Histogram(
    "billing_calculation_duration_seconds",
    "Billing calculation duration in seconds",
)


class BillingRequest(BaseModel):
    roomFee: int = Field(ge=0)
    electricityUsage: float = Field(ge=0)
    electricityUnitPrice: int = Field(ge=0)
    waterUsage: float = Field(ge=0)
    waterUnitPrice: int = Field(ge=0)
    serviceFee: int = Field(ge=0)


class BillingResponse(BaseModel):
    roomFee: int
    electricityFee: int
    waterFee: int
    serviceFee: int
    totalAmount: int


@app.get("/health")
def health():
    REQUEST_COUNT.labels(endpoint="/health").inc()
    return {"success": True, "service": "billing-service-python"}


@app.post("/calculate", response_model=BillingResponse)
def calculate(payload: BillingRequest):
    REQUEST_COUNT.labels(endpoint="/calculate").inc()
    with CALCULATION_DURATION.time():
        electricity_fee = round(payload.electricityUsage * payload.electricityUnitPrice)
        water_fee = round(payload.waterUsage * payload.waterUnitPrice)
        total_amount = payload.roomFee + electricity_fee + water_fee + payload.serviceFee

        return BillingResponse(
            roomFee=payload.roomFee,
            electricityFee=electricity_fee,
            waterFee=water_fee,
            serviceFee=payload.serviceFee,
            totalAmount=total_amount,
        )


@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
