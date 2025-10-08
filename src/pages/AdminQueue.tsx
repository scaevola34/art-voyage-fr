import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, memo } from "react";
import { CheckCircle, XCircle, Clock, MapPin, Filter } from "lucide-react";
import { locations, Location } from "@/data/locations";
import { createAuditEntry, generateDiff, appendToAuditLog, formatDiff } from "@/lib/admin/auditLog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Submission {
  id: string;
  type: 'add' | 'update';
  targetId?: string;
  payload: any;
  status: 'draft' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewer?: string;
  notes?: string;
}

const AdminQueue = memo(() => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'add' | 'update'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'approved' | 'rejected'>('draft');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  // Load submissions
  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = () => {
    try {
      const stored = localStorage.getItem('submissions');
      if (stored) {
        setSubmissions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
    }
  };

  const saveSubmissions = (updated: Submission[]) => {
    try {
      localStorage.setItem('submissions', JSON.stringify(updated, null, 2));
      setSubmissions(updated);
    } catch (error) {
      console.error('Failed to save submissions:', error);
    }
  };

  const handleApprove = async (submission: Submission) => {
    setIsReviewing(true);
    try {
      let locationsData = [...locations];

      if (submission.type === 'add') {
        // Add new location
        const newLocation: Location = {
          id: `loc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: submission.payload.name,
          type: submission.payload.type,
          description: submission.payload.description || '',
          address: submission.payload.address || '',
          city: submission.payload.city,
          region: submission.payload.region,
          coordinates: {
            lat: submission.payload.latitude,
            lng: submission.payload.longitude,
          },
          website: submission.payload.website || undefined,
          email: submission.payload.email || undefined,
          instagram: submission.payload.instagram || undefined,
          openingHours: submission.payload.openingHours || undefined,
          image: submission.payload.image || undefined,
        };

        locationsData.push(newLocation);

        // Create audit entry
        const auditEntry = createAuditEntry(
          'approve',
          submission.id,
          'add',
          'admin',
          {
            notes: reviewNotes || 'Nouveau lieu approuvé',
          }
        );
        appendToAuditLog(auditEntry);

        toast({
          title: "Lieu ajouté",
          description: `${newLocation.name} a été ajouté à la carte.`,
        });
      } else if (submission.type === 'update' && submission.targetId) {
        // Update existing location
        const targetIndex = locationsData.findIndex((loc) => loc.id === submission.targetId);
        
        if (targetIndex !== -1) {
          const oldLocation = locationsData[targetIndex];
          const updatedLocation = {
            ...oldLocation,
            ...Object.fromEntries(
              Object.entries(submission.payload).filter(([key, val]) => 
                val !== undefined && val !== '' && key !== 'mode' && key !== 'targetId' && key !== 'reason'
              )
            ),
            coordinates: {
              lat: submission.payload.latitude ?? oldLocation.coordinates.lat,
              lng: submission.payload.longitude ?? oldLocation.coordinates.lng,
            },
          };

          locationsData[targetIndex] = updatedLocation;

          // Generate diff
          const diff = generateDiff(oldLocation, updatedLocation);

          // Create audit entry
          const auditEntry = createAuditEntry(
            'approve',
            submission.id,
            'update',
            'admin',
            {
              targetId: submission.targetId,
              notes: reviewNotes || submission.payload.reason || 'Mise à jour approuvée',
              diff,
            }
          );
          appendToAuditLog(auditEntry);

          toast({
            title: "Correction appliquée",
            description: `${updatedLocation.name} a été mis à jour.`,
          });
        }
      }

      // Update submission status
      const updatedSubmissions = submissions.map((sub) =>
        sub.id === submission.id
          ? {
              ...sub,
              status: 'approved' as const,
              reviewedAt: new Date().toISOString(),
              reviewer: 'admin',
              notes: reviewNotes,
            }
          : sub
      );
      saveSubmissions(updatedSubmissions);

      // Note: In production, this would save to backend
      console.log('Updated locations:', locationsData);

      setSelectedSubmission(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Approval error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la suggestion.",
        variant: "destructive",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleReject = (submission: Submission) => {
    setIsReviewing(true);
    try {
      // Create audit entry
      const auditEntry = createAuditEntry(
        'reject',
        submission.id,
        submission.type,
        'admin',
        {
          targetId: submission.targetId,
          notes: reviewNotes || 'Suggestion rejetée',
        }
      );
      appendToAuditLog(auditEntry);

      // Update submission status
      const updatedSubmissions = submissions.map((sub) =>
        sub.id === submission.id
          ? {
              ...sub,
              status: 'rejected' as const,
              reviewedAt: new Date().toISOString(),
              reviewer: 'admin',
              notes: reviewNotes,
            }
          : sub
      );
      saveSubmissions(updatedSubmissions);

      toast({
        title: "Suggestion rejetée",
        description: reviewNotes || 'La suggestion a été rejetée.',
      });

      setSelectedSubmission(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Rejection error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la suggestion.",
        variant: "destructive",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterType !== 'all' && sub.type !== filterType) return false;
    if (filterStatus !== 'all' && sub.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400"><XCircle className="h-3 w-3 mr-1" />Rejeté</Badge>;
    }
  };

  const getTypeBadge = (type: 'add' | 'update') => {
    return type === 'add' ? (
      <Badge variant="secondary">Nouveau lieu</Badge>
    ) : (
      <Badge variant="secondary">Correction</Badge>
    );
  };

  const getTargetLocation = (targetId?: string) => {
    if (!targetId) return null;
    return locations.find((loc) => loc.id === targetId);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">File d'attente admin</h1>
          <p className="text-muted-foreground">
            Gérez les suggestions et corrections de la communauté
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={filterType} onValueChange={(val: any) => setFilterType(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="add">Nouveaux lieux</SelectItem>
                    <SelectItem value="update">Corrections</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={filterStatus} onValueChange={(val: any) => setFilterStatus(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="draft">En attente</SelectItem>
                    <SelectItem value="approved">Approuvés</SelectItem>
                    <SelectItem value="rejected">Rejetés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions table */}
        <Card>
          <CardHeader>
            <CardTitle>Suggestions ({filteredSubmissions.length})</CardTitle>
            <CardDescription>
              Cliquez sur une ligne pour voir les détails et modérer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune suggestion à afficher</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Nom du lieu</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => {
                    const targetLocation = getTargetLocation(submission.targetId);
                    return (
                      <TableRow key={submission.id}>
                        <TableCell>{getTypeBadge(submission.type)}</TableCell>
                        <TableCell className="font-medium">
                          {submission.type === 'add' 
                            ? submission.payload.name 
                            : targetLocation?.name || 'Lieu introuvable'}
                        </TableCell>
                        <TableCell>
                          {submission.payload.city || targetLocation?.city}
                        </TableCell>
                        <TableCell>
                          {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            Examiner
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Review dialog */}
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedSubmission?.type === 'add' ? 'Nouveau lieu' : 'Correction suggérée'}
              </DialogTitle>
              <DialogDescription>
                Soumis le {selectedSubmission && new Date(selectedSubmission.submittedAt).toLocaleDateString('fr-FR')}
              </DialogDescription>
            </DialogHeader>

            {selectedSubmission && (
              <div className="space-y-6">
                {/* Reason for update */}
                {selectedSubmission.type === 'update' && selectedSubmission.payload.reason && (
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <h4 className="font-semibold mb-2">Raison de la correction</h4>
                    <p className="text-sm">{selectedSubmission.payload.reason}</p>
                  </div>
                )}

                {/* Location details */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Détails du lieu</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nom:</span>
                      <p className="font-medium">{selectedSubmission.payload.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium">
                        {selectedSubmission.payload.type === 'gallery' ? 'Galerie' :
                         selectedSubmission.payload.type === 'association' ? 'Association' : 'Festival'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ville:</span>
                      <p className="font-medium">{selectedSubmission.payload.city}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Région:</span>
                      <p className="font-medium">{selectedSubmission.payload.region}</p>
                    </div>
                    {selectedSubmission.payload.address && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Adresse:</span>
                        <p className="font-medium">{selectedSubmission.payload.address}</p>
                      </div>
                    )}
                    {selectedSubmission.payload.description && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Description:</span>
                        <p className="font-medium">{selectedSubmission.payload.description}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Coordonnées:
                      </span>
                      <p className="font-medium">
                        {selectedSubmission.payload.latitude?.toFixed(4)}, {selectedSubmission.payload.longitude?.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  {/* Optional fields */}
                  {(selectedSubmission.payload.website || selectedSubmission.payload.email || selectedSubmission.payload.instagram) && (
                    <div className="space-y-2 pt-4 border-t">
                      {selectedSubmission.payload.website && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Site web:</span>{' '}
                          <a href={selectedSubmission.payload.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {selectedSubmission.payload.website}
                          </a>
                        </div>
                      )}
                      {selectedSubmission.payload.email && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Email:</span>{' '}
                          <span>{selectedSubmission.payload.email}</span>
                        </div>
                      )}
                      {selectedSubmission.payload.instagram && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Instagram:</span>{' '}
                          <span>@{selectedSubmission.payload.instagram}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submitter info */}
                {(selectedSubmission.payload.submitterName || selectedSubmission.payload.submitterEmail) && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-sm">Soumis par</h4>
                    <div className="text-sm space-y-1">
                      {selectedSubmission.payload.submitterName && (
                        <p>{selectedSubmission.payload.submitterName}</p>
                      )}
                      {selectedSubmission.payload.submitterEmail && (
                        <p className="text-muted-foreground">{selectedSubmission.payload.submitterEmail}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Review notes */}
                {selectedSubmission.status === 'draft' && (
                  <div className="space-y-2">
                    <Label htmlFor="reviewNotes">Notes de modération (optionnel)</Label>
                    <Textarea
                      id="reviewNotes"
                      placeholder="Ajoutez des notes sur votre décision..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                {/* Actions */}
                {selectedSubmission.status === 'draft' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(selectedSubmission)}
                      disabled={isReviewing}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(selectedSubmission)}
                      disabled={isReviewing}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  </div>
                )}

                {/* Review info */}
                {selectedSubmission.status !== 'draft' && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-sm">
                      {selectedSubmission.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                    </h4>
                    <div className="text-sm space-y-1">
                      <p>Le {new Date(selectedSubmission.reviewedAt!).toLocaleDateString('fr-FR')}</p>
                      {selectedSubmission.notes && (
                        <p className="text-muted-foreground">{selectedSubmission.notes}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
});

AdminQueue.displayName = "AdminQueue";

export default AdminQueue;
