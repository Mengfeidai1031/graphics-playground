using UnityEngine;
using System.Collections.Generic;

public class TrackGeneratorAuto : MonoBehaviour
{
    [Header("Configuración de la Carretera")]
    public float roadWidth = 15f;
    public float roadLength = 200f;
    
    private List<GameObject> checkpoints = new List<GameObject>();
    
    void Start()
    {
        GenerateRoad();
        CreateCheckpoints();
    }
    
    void GenerateRoad()
    {
        // 1. CREAR SUELO VERDE (CÉSPED) - MÚLTIPLES PLANOS
        for (int i = -2; i <= 2; i++)
        {
            for (int j = -2; j <= 2; j++)
            {
                GameObject ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
                ground.name = $"Ground_{i}_{j}";
                ground.transform.position = new Vector3(i * 100f, 0, j * 100f);
                ground.transform.localScale = new Vector3(10, 1, 10);
                
                // Destruir material existente y crear uno nuevo
                Renderer groundRenderer = ground.GetComponent<Renderer>();
                DestroyImmediate(groundRenderer.sharedMaterial);
                
                Material greenMat = new Material(Shader.Find("Unlit/Color"));
                greenMat.color = new Color(0.25f, 0.6f, 0.25f);
                groundRenderer.material = greenMat;
                groundRenderer.sharedMaterial = greenMat;
                
                ground.transform.SetParent(transform);
            }
        }
        
        // 2. CREAR CARRETERA GRIS OSCURO
        GameObject road = GameObject.CreatePrimitive(PrimitiveType.Cube);
        road.name = "Road_Asphalt";
        road.transform.position = new Vector3(0, 0.05f, 0);
        road.transform.localScale = new Vector3(roadWidth, 0.1f, roadLength);
        
        // Destruir material existente
        Renderer roadRenderer = road.GetComponent<Renderer>();
        DestroyImmediate(roadRenderer.sharedMaterial);
        
        // Crear material GRIS OSCURO sin iluminación
        Material asphaltMat = new Material(Shader.Find("Unlit/Color"));
        asphaltMat.color = new Color(0.25f, 0.25f, 0.25f);
        roadRenderer.material = asphaltMat;
        roadRenderer.sharedMaterial = asphaltMat;
        
        road.transform.SetParent(transform);
        
        // 3. LÍNEA BLANCA CENTRAL DISCONTINUA
        CreateCenterLine();
        
        // 4. LÍNEAS BLANCAS LATERALES
        CreateSideLine(roadWidth / 2f - 0.3f, "LineaDerechaBlanca");
        CreateSideLine(-roadWidth / 2f + 0.3f, "LineaIzquierdaBlanca");
        
        Debug.Log("✓ Carretera generada - Gris oscuro con líneas blancas");
    }
    
    void CreateCenterLine()
    {
        GameObject centerLineParent = new GameObject("LineaCentralBlanca");
        centerLineParent.transform.SetParent(transform);
        
        int segments = 50;
        float segmentLength = roadLength / (segments * 2);
        
        for (int i = 0; i < segments; i++)
        {
            GameObject segment = GameObject.CreatePrimitive(PrimitiveType.Cube);
            segment.name = $"WhiteSegment_{i}";
            
            float zPos = -roadLength / 2f + (i * segmentLength * 2) + segmentLength;
            segment.transform.position = new Vector3(0, 0.12f, zPos);
            segment.transform.localScale = new Vector3(0.4f, 0.02f, segmentLength * 0.8f);
            
            // Destruir material y crear BLANCO
            Renderer segmentRenderer = segment.GetComponent<Renderer>();
            DestroyImmediate(segmentRenderer.sharedMaterial);
            
            Material whiteMat = new Material(Shader.Find("Unlit/Color"));
            whiteMat.color = new Color(1f, 1f, 1f); // BLANCO PURO
            segmentRenderer.material = whiteMat;
            segmentRenderer.sharedMaterial = whiteMat;
            
            segment.transform.SetParent(centerLineParent.transform);
            
            DestroyImmediate(segment.GetComponent<Collider>());
        }
    }
    
    void CreateSideLine(float xOffset, string name)
    {
        GameObject sideLine = GameObject.CreatePrimitive(PrimitiveType.Cube);
        sideLine.name = name;
        sideLine.transform.position = new Vector3(xOffset, 0.12f, 0);
        sideLine.transform.localScale = new Vector3(0.4f, 0.02f, roadLength);
        
        // Destruir material y crear BLANCO
        Renderer lineRenderer = sideLine.GetComponent<Renderer>();
        DestroyImmediate(lineRenderer.sharedMaterial);
        
        Material whiteMat = new Material(Shader.Find("Unlit/Color"));
        whiteMat.color = new Color(1f, 1f, 1f); // BLANCO PURO
        lineRenderer.material = whiteMat;
        lineRenderer.sharedMaterial = whiteMat;
        
        sideLine.transform.SetParent(transform);
        
        DestroyImmediate(sideLine.GetComponent<Collider>());
    }
    
    void CreateCheckpoints()
    {
        int numCheckpoints = 8;
        float spacing = roadLength / numCheckpoints;
        
        for (int i = 0; i < numCheckpoints; i++)
        {
            float zPos = -roadLength / 2f + (i * spacing) + spacing / 2f;
            Vector3 position = new Vector3(0, 3, zPos);
            
            GameObject checkpoint = CreateCheckpoint(position, i);
            checkpoints.Add(checkpoint);
        }
        
        TestTrackManagerAuto manager = FindObjectOfType<TestTrackManagerAuto>();
        if (manager != null)
        {
            manager.SetCheckpoints(checkpoints.ToArray());
        }
    }
    
    GameObject CreateCheckpoint(Vector3 position, int index)
    {
        GameObject checkpoint = GameObject.CreatePrimitive(PrimitiveType.Cube);
        checkpoint.name = $"Checkpoint_{index}";
        checkpoint.transform.position = position;
        checkpoint.transform.localScale = new Vector3(roadWidth * 1.3f, 8f, 2f);
        
        // HACER INVISIBLE - Desactivar el renderer
        Renderer rend = checkpoint.GetComponent<Renderer>();
        rend.enabled = false; // ← ESTO HACE QUE SEA INVISIBLE
        
        // Configurar trigger (la física sigue funcionando aunque sea invisible)
        BoxCollider collider = checkpoint.GetComponent<BoxCollider>();
        collider.isTrigger = true;
        
        // Script
        CheckpointAuto checkScript = checkpoint.AddComponent<CheckpointAuto>();
        checkScript.checkpointIndex = index;
        
        checkpoint.transform.SetParent(transform);
        
        return checkpoint;
    }
}