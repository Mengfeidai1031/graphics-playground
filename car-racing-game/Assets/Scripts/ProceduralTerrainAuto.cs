using UnityEngine;
using System.Collections;

public class ProceduralTerrainAuto : MonoBehaviour
{
    [Header("Auto-configuración")]
    public int terrainSize = 400;
    public int treeCount = 150;
    public int rockCount = 80;
    
    private GameObject treePrefab;
    private GameObject rockPrefab;
    
    void Start()
    {
        StartCoroutine(GenerateEverything());
    }
    
    IEnumerator GenerateEverything()
    {
        // Crear prefabs básicos
        CreateBasicPrefabs();
        yield return null;
        
        // Generar terreno
        GenerateTerrain();
        yield return null;
        
        // Poblar terreno
        PopulateTerrain();
    }
    
    void CreateBasicPrefabs()
    {
        // Crear árbol simple
        treePrefab = new GameObject("TreePrefab");
        
        GameObject trunk = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        trunk.transform.SetParent(treePrefab.transform);
        trunk.transform.localPosition = Vector3.zero;
        trunk.transform.localScale = new Vector3(0.3f, 2f, 0.3f);
        trunk.GetComponent<Renderer>().material.color = new Color(0.4f, 0.2f, 0.1f);
        
        GameObject leaves = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        leaves.transform.SetParent(treePrefab.transform);
        leaves.transform.localPosition = new Vector3(0, 3, 0);
        leaves.transform.localScale = new Vector3(2, 2, 2);
        leaves.GetComponent<Renderer>().material.color = new Color(0.1f, 0.5f, 0.1f);
        
        // Crear roca simple
        rockPrefab = GameObject.CreatePrimitive(PrimitiveType.Cube);
        rockPrefab.name = "RockPrefab";
        rockPrefab.transform.localScale = new Vector3(1, 0.7f, 1.2f);
        rockPrefab.GetComponent<Renderer>().material.color = new Color(0.5f, 0.5f, 0.5f);
    }
    
    void GenerateTerrain()
    {
        GameObject plane = GameObject.CreatePrimitive(PrimitiveType.Plane);
        plane.name = "Ground";
        plane.transform.localScale = new Vector3(terrainSize / 10f, 1, terrainSize / 10f);
        plane.transform.position = new Vector3(terrainSize / 2f, 0, terrainSize / 2f);
        
        // Material verde forzado
        Material groundMat = plane.GetComponent<Renderer>().material;
        groundMat.color = new Color(0.2f, 0.6f, 0.2f); // Verde césped brillante
        
        plane.transform.SetParent(transform);
    }
    
    void PopulateTerrain()
    {
        // Árboles
        for (int i = 0; i < treeCount; i++)
        {
            Vector3 pos = new Vector3(
                Random.Range(20f, terrainSize - 20f),
                0,
                Random.Range(20f, terrainSize - 20f)
            );
            
            GameObject tree = Instantiate(treePrefab, pos, Quaternion.Euler(0, Random.Range(0f, 360f), 0));
            tree.transform.localScale = Vector3.one * Random.Range(0.8f, 1.5f);
            tree.transform.SetParent(transform);
        }
        
        // Rocas
        for (int i = 0; i < rockCount; i++)
        {
            Vector3 pos = new Vector3(
                Random.Range(20f, terrainSize - 20f),
                0.35f,
                Random.Range(20f, terrainSize - 20f)
            );
            
            GameObject rock = Instantiate(rockPrefab, pos, Random.rotation);
            rock.transform.localScale = Vector3.one * Random.Range(0.5f, 1.5f);
            rock.transform.SetParent(transform);
        }
        
        Debug.Log("✓ Terreno generado con árboles y rocas");
    }
}