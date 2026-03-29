"""
Generate the architecture diagram for the Fullstack Video project.

Requirements:
    pip install diagrams
    brew install graphviz   (or apt-get install graphviz)

Usage:
    python docs/generate_architecture.py

Outputs:
    docs/architecture.png
"""

from diagrams import Cluster, Diagram, Edge
from diagrams.aws.storage import S3
from diagrams.onprem.queue import Kafka
from diagrams.onprem.compute import Server
from diagrams.onprem.database import Postgresql
from diagrams.onprem.client import Client
from diagrams.onprem.container import Docker
from diagrams.programming.framework import React, Django
from diagrams.onprem.network import Zookeeper

graph_attr = {
    "fontsize": "14",
    "bgcolor": "#0d1117",
    "fontcolor": "#c9d1d9",
    "pad": "0.5",
    "ranksep": "1.0",
    "nodesep": "0.8",
}

node_attr = {
    "fontcolor": "#f0f6fc",
    "color": "#30363d",
}

edge_attr = {
    "fontcolor": "#f0f6fc",
    "fontsize": "11",
}

cluster_attr = {
    "bgcolor": "#161b22",
    "pencolor": "#30363d",
    "fontcolor": "#f0f6fc",
}

with Diagram(
    "Fullstack Video — Event-Driven Processing Pipeline",
    filename="docs/architecture",
    show=False,
    direction="LR",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr,
    outformat="png",
):
    browser = Client("Browser\nlocalhost:3000")

    with Cluster("Frontend Container", graph_attr=cluster_attr):
        frontend = React("React + TypeScript\nChakra UI")

    with Cluster("Backend Container", graph_attr=cluster_attr):
        api = Django("Django REST API\nlocalhost:8000")

    with Cluster("Kafka Cluster", graph_attr=cluster_attr):
        zk = Zookeeper("Zookeeper")
        broker = Kafka("Kafka Broker\nvideo_uploaded topic")
        zk - Edge(style="dashed", color="#484f58") - broker

    with Cluster("Worker Container", graph_attr=cluster_attr):
        worker = Server("Processing Worker\n(ffprobe + ffmpeg)")

    with Cluster("AWS", graph_attr=cluster_attr):
        s3 = S3("S3 Bucket\nVideos & Thumbnails")

    db = Postgresql("SQLite\n(shared volume)")

    # User flow
    browser >> Edge(label="Upload video", color="#3fb950") >> frontend
    frontend >> Edge(label="POST /videos/", color="#3fb950") >> api

    # API stores file and publishes event
    api >> Edge(label="Store .mp4", color="#d29922") >> s3
    api >> Edge(label="Save metadata", color="#79c0ff") >> db
    api >> Edge(label="Publish event", color="#58a6ff", style="bold") >> broker

    # Worker consumes and processes
    broker >> Edge(label="Consume event", color="#58a6ff", style="bold") >> worker
    worker >> Edge(label="Download .mp4", color="#d29922", style="dashed") >> s3
    worker >> Edge(label="Upload thumbnail", color="#d29922") >> s3
    worker >> Edge(label="Update status\n+ metadata", color="#79c0ff") >> db

    # Frontend polls for updates
    frontend >> Edge(label="GET /videos/\n(poll)", color="#a5d6ff", style="dashed") >> api
    api >> Edge(label="Read", color="#a5d6ff", style="dashed") >> db
