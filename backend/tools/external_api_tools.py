# In backend/tools/external_api_tools.py

from crewai.tools import BaseTool
import os
from typing import Type

class GetTrafficInfoTool(BaseTool):
    name: str = "Get Traffic Information"
    description: str = "Provides real-time traffic information and estimated travel time to a destination."

    def _run(self, destination: str) -> str:
        return f"Traffic to the hospital is moderate. Estimated travel time is about 25 minutes."

# Instantiate the tool for export
get_traffic_info_tool = GetTrafficInfoTool()