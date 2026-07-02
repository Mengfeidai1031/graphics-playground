using UnityEngine;

public class CheckpointAuto : MonoBehaviour
{
    public int checkpointIndex;
    
    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player") || other.transform.root.CompareTag("Player"))
        {
            TestTrackManagerAuto manager = FindObjectOfType<TestTrackManagerAuto>();
            if (manager != null)
            {
                manager.PassCheckpoint(checkpointIndex);
            }
        }
    }
}