from sqlmodel import Field, SQLModel

class ViewerBase(SQLModel):
    name: str = Field(min_length=1, max_length=100, index=True)
    
class Viewer(ViewerBase, table=True):
    id: int = Field(default=None, primary_key=True)
    
class ViewerCreate(ViewerBase):
    pass