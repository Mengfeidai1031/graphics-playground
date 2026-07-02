using UnityEngine;

public class CoinAuto : MonoBehaviour
{
    public float rotationSpeed = 100f;
    public float bobSpeed = 2f;
    public float bobHeight = 0.3f;
    
    private Vector3 startPosition;
    
    void Start()
    {
        startPosition = transform.position;
    }
    
    void Update()
    {
        // Rotar
        transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime);
        
        // Efecto de flotación
        float newY = startPosition.y + Mathf.Sin(Time.time * bobSpeed) * bobHeight;
        transform.position = new Vector3(transform.position.x, newY, transform.position.z);
    }
    
    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player") || other.transform.root.CompareTag("Player"))
        {
            if (CoinGameManagerAuto.instance != null)
            {
                CoinGameManagerAuto.instance.CollectCoin();
            }
            
            // Efecto de destrucción
            Destroy(gameObject);
        }
    }
}