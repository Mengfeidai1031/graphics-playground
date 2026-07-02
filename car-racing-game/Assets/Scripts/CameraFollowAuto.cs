using UnityEngine;

public class CameraFollowAuto : MonoBehaviour
{
    public Transform target;
    
    [Header("Configuración Auto")]
    public Vector3 offset = new Vector3(0, 3, -8);
    public float smoothSpeed = 5f;
    public float rotationSpeed = 3f;
    public float lookAheadDistance = 5f;
    
    private Vector3 currentVelocity;
    
    void LateUpdate()
    {
        if (target == null) return;
        
        // Posición objetivo detrás del coche
        Vector3 targetPosition = target.position + target.TransformDirection(offset);
        
        // Suavizar movimiento
        transform.position = Vector3.SmoothDamp(transform.position, targetPosition, ref currentVelocity, 1f / smoothSpeed);
        
        // Mirar hacia adelante del coche
        Vector3 lookAtPosition = target.position + target.forward * lookAheadDistance + Vector3.up;
        Quaternion targetRotation = Quaternion.LookRotation(lookAtPosition - transform.position);
        transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.deltaTime);
    }
}